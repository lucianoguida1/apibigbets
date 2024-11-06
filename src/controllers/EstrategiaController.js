const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const JogoServices = require('../services/JogoServices.js');
const { startOfWeek } = require('date-fns'); // Para cálculo de semanas

const estrategiaServices = new EstrategiaServices();
const bilheteServices = new BilheteServices();
const jogoServices = new JogoServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async getTopEstrategia(req, res) {
        try {
            const estrategia = await estrategiaServices.pegaUmRegistro({
                where: { taxaacerto: { [Op.ne]: null } },
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
            let odds = []; // Inicializa o array para armazenar todas as odds
            let oddsVitoriosas = []; // Para cálculo de media_odd_vitoriosa
            let oddsDerrotadas = []; // Para cálculo de media_odd_derrotada
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
            const bilhetesCriar = [];
            let result = await estrategia.getBilhetes({
                attributes: [[Sequelize.fn('MAX', Sequelize.col('bilhete_id')), 'maxBilheteId']]
            });

            // Acessa o valor diretamente do primeiro registro ou define como 1 se for nulo ou não existir
            let i  = result[0].get('maxBilheteId') || 1;

            const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

            for (const jogo of jogosArray) {
                if (!apostas[i]) {
                    apostas[i] = {
                        odd: 1,
                        status: true,
                        jogos: []
                    };
                }

                bilhetesCriar.push(
                    { bilhete_id: i, jogo_id: jogo.id, estrategia_id: estrategia.id, odd_id: jogo.odd_id }
                );

                apostas[i].jogos.push(jogo);
                apostas[i].odd *= jogo.odd;
                odds.push(jogo.odd); // Armazena cada odd no array `odds`

                const dataAposta = jogo.data;
                const semanaAposta = startOfWeek(new Date(dataAposta)).toISOString(); // Usa a data da semana

                // Verifica se a aposta atual já contém a quantidade necessária de jogos para uma múltipla
                if (apostas[i].jogos.length >= regras.length) {
                    apostas[i].status = apostas[i].jogos.every((j) => j.statusOdd === true);

                    if (apostas[i].status) {
                        acertos++;
                        oddsVitoriosas.push(apostas[i].odd); // Adiciona a odd das apostas vencedoras
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
                        oddsDerrotadas.push(apostas[i].odd); // Adiciona a odd das apostas perdedoras
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

            //cria os bilhetes no banco
            await bilheteServices.criaVariosRegistros(bilhetesCriar);

            // Calcula valores para os novos campos
            const totalApostas = i - 1;
            const oddMedia = odds.reduce((acc, odd) => acc + odd, 0) / odds.length;
            const oddMinima = Math.min(...odds);
            const oddMaxima = Math.max(...odds);
            const mediaOddVitoriosa = oddsVitoriosas.length > 0
                ? (oddsVitoriosas.reduce((acc, odd) => acc + odd, 0) / oddsVitoriosas.length)
                : 0;
            const mediaOddDerrotada = oddsDerrotadas.length > 0
                ? (oddsDerrotadas.reduce((acc, odd) => acc + odd, 0) / oddsDerrotadas.length)
                : 0;

            // Calcula frequência de apostas por dia
            const frequenciaApostasDia = Object.keys(diasVitorias).length > 0
                ? totalApostas / Object.keys(diasVitorias).length
                : 0;

            // Calcula lucro total com base nas odds de apostas vencedoras
            const aposta = 1; // Valor da aposta por conjunto
            const totalPerdas = erros * aposta; // Total perdido em apostas erradas
            const lucroTotal = oddsVitoriosas.reduce((acc, odd) => acc + (odd * aposta - aposta), 0) - totalPerdas;

            // Calcula média de sequência de vitórias
            const mediaSequenciaVitorias = numSequencias > 0 ? totalSequenciaVitorias / numSequencias : 0;

            // Calcula o maior número de vitórias e derrotas em um único dia e semana
            const maiorVitoriasDia = Math.max(...Object.values(diasVitorias));
            const maiorVitoriasSemana = Math.max(...Object.values(semanasVitorias));
            const maiorDerrotasDia = Math.max(...Object.values(diasDerrotas));
            const maiorDerrotasSemana = Math.max(...Object.values(semanasDerrotas));

            // Atualiza os dados da estratégia
            estrategia.totalacerto = acertos;
            estrategia.totalerro = erros;
            estrategia.taxaacerto = ((acertos / (acertos + erros)) * 100).toFixed(2);
            estrategia.odd_media = oddMedia;
            estrategia.odd_minima = oddMinima;
            estrategia.odd_maxima = oddMaxima;
            estrategia.media_odd_vitoriosa = mediaOddVitoriosa;
            estrategia.media_odd_derrotada = mediaOddDerrotada;
            estrategia.total_apostas = totalApostas;
            estrategia.frequencia_apostas_dia = frequenciaApostasDia;
            estrategia.sequencia_vitorias = maiorSequenciaVitorias;
            estrategia.sequencia_derrotas = maiorSequenciaDerrotas;
            estrategia.total_vitorias = acertos;
            estrategia.total_derrotas = erros;
            estrategia.lucro_total = lucroTotal;
            estrategia.qtde_usuarios = 0;
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

        return Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
    }
}

module.exports = EstrategiaController;
