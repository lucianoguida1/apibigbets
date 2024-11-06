const { Op, Sequelize } = require('sequelize');
const { startOfWeek } = require('date-fns');
const Services = require('./Services.js');
const { Regra } = require('../database/models');
const JogoServices = require('./JogoServices');
const BilheteServices = require('./BilheteServices.js');

const bilheteServices = new BilheteServices();
const jogoServices = new JogoServices();

class EstrategiaServices extends Services {
    constructor() {
        super('Estrategia');
    }

    async getTopEstrategia() {
        const estrategia = await super.pegaUmRegistro({
            where: { taxaacerto: { [Op.ne]: null } },
            order: [['taxaacerto', 'DESC']],
            include: {
                model: Regra,
                require: true,
            }
        });
        return estrategia;
    }

    async executarEstrategia(estrategiaId) {
        const estrategia = await this.pegaUmRegistroPorId(estrategiaId);
        if (!estrategia) {
            throw new Error('Estratégia não encontrada!');
        }

        const regras = await estrategia.getRegras();
        if (regras.length === 0) {
            throw new Error('Estratégia não contém regras!');
        }

        const jogosUnicos = await this.filtrarJogosUnicos(regras);
        if (jogosUnicos.length === 0) {
            throw new Error('Nenhum jogo encontrado!');
        }
        if (jogosUnicos.length <= regras.length){
            throw new Error('Quantidade de jogos insuficiente!');
        }
        let apostas = {};
        let acertos = 0;
        let erros = 0;
        let odds = [];
        let oddsVitoriosas = [];
        let oddsDerrotadas = [];
        let sequenciaVitorias = 0;
        let sequenciaDerrotas = 0;
        let maiorSequenciaVitorias = 0;
        let maiorSequenciaDerrotas = 0;
        const diasVitorias = {};
        const diasDerrotas = {};
        const semanasVitorias = {};
        const semanasDerrotas = {};
        let totalSequenciaVitorias = 0;
        let numSequencias = 0;
        const bilhetesCriar = [];

        let result = await estrategia.getBilhetes({
            attributes: [[Sequelize.fn('MAX', Sequelize.col('bilhete_id')), 'maxBilheteId']]
        });

        let i = result[0]?.get('maxBilheteId') || 1;

        const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

        for (const jogo of jogosArray) {
            if (!apostas[i]) {
                apostas[i] = { odd: 1, status: true, jogos: [] };
            }

            bilhetesCriar.push({
                bilhete_id: i,
                jogo_id: jogo.id,
                estrategia_id: estrategia.id,
                odd_id: jogo.odd_id
            });

            apostas[i].jogos.push(jogo);
            apostas[i].odd *= jogo.odd;
            odds.push(jogo.odd);

            const dataAposta = jogo.data;
            const semanaAposta = startOfWeek(new Date(dataAposta)).toISOString();

            if (apostas[i].jogos.length >= regras.length) {
                apostas[i].status = apostas[i].jogos.every((j) => j.statusOdd === true);

                if (apostas[i].status) {
                    acertos++;
                    oddsVitoriosas.push(apostas[i].odd);
                    sequenciaVitorias++;
                    totalSequenciaVitorias += sequenciaVitorias;
                    numSequencias++;

                    diasVitorias[dataAposta] = (diasVitorias[dataAposta] || 0) + 1;
                    semanasVitorias[semanaAposta] = (semanasVitorias[semanaAposta] || 0) + 1;
                    maiorSequenciaVitorias = Math.max(maiorSequenciaVitorias, sequenciaVitorias);
                    sequenciaDerrotas = 0;
                } else {
                    erros++;
                    oddsDerrotadas.push(apostas[i].odd);
                    sequenciaDerrotas++;
                    maiorSequenciaDerrotas = Math.max(maiorSequenciaDerrotas, sequenciaDerrotas);

                    diasDerrotas[dataAposta] = (diasDerrotas[dataAposta] || 0) + 1;
                    semanasDerrotas[semanaAposta] = (semanasDerrotas[semanaAposta] || 0) + 1;
                    sequenciaVitorias = 0;
                }

                i++;
            }
        }

        await bilheteServices.criaVariosRegistros(bilhetesCriar);

        const totalApostas = (acertos + erros);
        const oddMedia = odds.length > 0 ? odds.reduce((acc, odd) => acc + odd, 0) / odds.length : 0;
        const oddMinima = odds.length > 0 ? Math.min(...odds) : 0;
        const oddMaxima = odds.length > 0 ? Math.max(...odds) : 0;
        const mediaOddVitoriosa = oddsVitoriosas.length > 0 ? oddsVitoriosas.reduce((acc, odd) => acc + odd, 0) / oddsVitoriosas.length : 0;
        const mediaOddDerrotada = oddsDerrotadas.length > 0 ? oddsDerrotadas.reduce((acc, odd) => acc + odd, 0) / oddsDerrotadas.length : 0;
        const frequenciaApostasDia = Object.keys(diasVitorias).length > 0 ? totalApostas / Object.keys(diasVitorias).length : 0;
        const aposta = 1;
        const totalPerdas = erros * aposta;
        const lucroTotal = oddsVitoriosas.reduce((acc, odd) => acc + (odd * aposta - aposta), 0) - totalPerdas;
        const mediaSequenciaVitorias = numSequencias > 0 ? totalSequenciaVitorias / numSequencias : 0;
        const maiorVitoriasDia = Object.values(diasVitorias).length > 0 ? Math.max(...Object.values(diasVitorias)) : 0;
        const maiorVitoriasSemana = Object.values(semanasVitorias).length > 0 ? Math.max(...Object.values(semanasVitorias)) : 0;
        const maiorDerrotasDia = Object.values(diasDerrotas).length > 0 ? Math.max(...Object.values(diasDerrotas)) : 0;
        const maiorDerrotasSemana = Object.values(semanasDerrotas).length > 0 ? Math.max(...Object.values(semanasDerrotas)) : 0;
        
        estrategia.totalacerto = acertos;
        estrategia.totalerro = erros;
        estrategia.taxaacerto = (acertos + erros > 0) ? ((acertos / (acertos + erros)) * 100).toFixed(2) : 0;
        estrategia.odd_media = oddMedia.toFixed(2);
        estrategia.odd_minima = oddMinima;
        estrategia.odd_maxima = oddMaxima;
        estrategia.media_odd_vitoriosa = mediaOddVitoriosa.toFixed(2);
        estrategia.media_odd_derrotada = mediaOddDerrotada.toFixed(2);
        estrategia.total_apostas = totalApostas;
        estrategia.frequencia_apostas_dia = frequenciaApostasDia;
        estrategia.sequencia_vitorias = maiorSequenciaVitorias;
        estrategia.sequencia_derrotas = maiorSequenciaDerrotas;
        estrategia.total_vitorias = acertos;
        estrategia.total_derrotas = erros;
        estrategia.lucro_total = lucroTotal.toFixed(2);
        estrategia.qtde_usuarios = 0;
        estrategia.media_sequencia_vitorias = mediaSequenciaVitorias;
        estrategia.maior_derrotas_dia = maiorDerrotasDia;
        estrategia.maior_derrotas_semana = maiorDerrotasSemana;
        estrategia.maior_vitorias_dia = maiorVitoriasDia;
        estrategia.maior_vitorias_semana = maiorVitoriasSemana;
        
        await estrategia.save();        

        return apostas;
    }

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

module.exports = EstrategiaServices;