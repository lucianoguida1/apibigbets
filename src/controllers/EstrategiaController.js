const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const JogoServices = require('../services/JogoServices.js');
const { startOfWeek, endOfWeek } = require('date-fns'); // Para cálculo de semanas

const estrategiaServices = new EstrategiaServices();
const jogoServices = new JogoServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async getTopEstrategia(req, res) {
        try {
            const estrategia = await estrategiaServices.pegaUmRegistro({
                order: [['taxaacerto', 'DESC']]
            });
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            return res.status(200).json(estrategia);
        } catch (error) {
            console.error('Erro ao buscar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao buscar estratégia: ' + error.message });
        }
    }

    async executarEstrategia(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID da estratégia não fornecido!' });
            }

            const estrategia = await estrategiaServices.pegaUmRegistroPorId(req.params.id);
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            const regras = await estrategia.getRegras();
            if (regras.length === 0) {
                return res.status(404).json({ error: 'Estratégia não contém regras!' });
            }

            const jogosUnicos = await this.filtrarJogosUnicos(regras);
            if (jogosUnicos.length === 0) {
                return res.status(404).json({ mensagem: 'Nenhum jogo encontrado!' });
            }

            let apostas = {};
            let acertos = 0;
            let erros = 0;
            let sequenciaVitorias = 0;
            let sequenciaDerrotas = 0;
            let maiorSequenciaVitorias = 0;
            let maiorSequenciaDerrotas = 0;
            const diasVitorias = {}; // Para contar vitórias por dia
            const diasDerrotas = {}; // Para contar derrotas por dia
            const semanasVitorias = {}; // Para contar vitórias por semana
            const semanasDerrotas = {}; // Para contar derrotas por semana
            let totalSequenciaVitorias = 0;
            let numSequencias = 0;

            const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
            let i = 1;

            for (const jogo of jogosArray) {
                if (!apostas[i]) {
                    apostas[i] = {
                        odd: 1,
                        status: true,
                        jogos: []
                    };
                }

                apostas[i].jogos.push(jogo);
                apostas[i].odd *= jogo.odd;

                const dataAposta = jogo.data;
                const semanaAposta = startOfWeek(new Date(dataAposta)).toISOString(); // Usa a data da semana

                // Verifica se a aposta atual já contém a quantidade necessária de jogos para uma múltipla
                if (apostas[i].jogos.length >= regras.length) {
                    apostas[i].status = apostas[i].jogos.every((j) => j.statusOdd === true);

                    if (apostas[i].status) {
                        acertos++;
                        sequenciaVitorias++;
                        totalSequenciaVitorias += sequenciaVitorias;
                        numSequencias++;

                        // Conta vitórias por dia e semana
                        diasVitorias[dataAposta] = (diasVitorias[dataAposta] || 0) + 1;
                        semanasVitorias[semanaAposta] = (semanasVitorias[semanaAposta] || 0) + 1;
                        maiorSequenciaVitorias = Math.max(maiorSequenciaVitorias, sequenciaVitorias);
                        sequenciaDerrotas = 0;
                    } else {
                        erros++;
                        sequenciaDerrotas++;
                        maiorSequenciaDerrotas = Math.max(maiorSequenciaDerrotas, sequenciaDerrotas);

                        // Conta derrotas por dia e semana
                        diasDerrotas[dataAposta] = (diasDerrotas[dataAposta] || 0) + 1;
                        semanasDerrotas[semanaAposta] = (semanasDerrotas[semanaAposta] || 0) + 1;
                        sequenciaVitorias = 0;
                    }

                    i++; // Passa para a próxima aposta
                }
            }

            // Calcula o maior número de vitórias e derrotas em um único dia e semana
            const maiorVitoriasDia = Math.max(...Object.values(diasVitorias));
            const maiorVitoriasSemana = Math.max(...Object.values(semanasVitorias));
            const maiorDerrotasDia = Math.max(...Object.values(diasDerrotas));
            const maiorDerrotasSemana = Math.max(...Object.values(semanasDerrotas));

            // Calcula média de sequência de vitórias
            const mediaSequenciaVitorias = numSequencias > 0 ? totalSequenciaVitorias / numSequencias : 0;

            // Atualiza os dados da estratégia
            estrategia.media_sequencia_vitorias = mediaSequenciaVitorias;
            estrategia.maior_derrotas_dia = maiorDerrotasDia || 0;
            estrategia.maior_derrotas_semana = maiorDerrotasSemana || 0;
            estrategia.maior_vitorias_dia = maiorVitoriasDia || 0;
            estrategia.maior_vitorias_semana = maiorVitoriasSemana || 0;

            await estrategia.save();

            return res.status(200).json(apostas);

        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }


    // Função para filtrar jogos únicos usando Promise.all para desempenho
    async filtrarJogosUnicos(regras) {
        const jogosUnicos = {};
        const jogosPorRegra = await Promise.all(
            regras.map((regra) => jogoServices.filtrarJogosPorRegra(regra))
        );

        jogosPorRegra.flat().forEach((jogo) => {
            if (!jogosUnicos[jogo.id]) {
                jogosUnicos[jogo.id] = jogo;
            }
        });

        // Retorna array de jogos únicos ordenados por data
        return Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
    }
}

module.exports = EstrategiaController;


/*
media de sequencia de vitoria
maior numero de derrota no dia
maior numero de derrota na semana
maior numero de vitoria no dia
maior numero de vitoria na semana

*/