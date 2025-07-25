const { Op } = require('sequelize');
const Services = require('./Services.js');
const { Estrategia, Regra, Regravalidacoe, Tipoaposta, Pai, Liga, Filtrojogo, Time, Bilhete, Jogo, Odd } = require('../database/models');


class EstrategiaServices extends Services {
    constructor() {
        super('Estrategia');
    }
    async getEstrategias(page = 1, pageSize = 5) {
        try {
            const { count, rows } = await Estrategia.findAndCountAll({
                limit: pageSize,
                offset: (page - 1) * pageSize,
                order: [['lucro_total', 'DESC']],
                attributes: {
                    exclude: ["grafico_json", "updatedAt", "createdAt", "deletedAt"]
                },
                include: {
                    model: Regra,
                    required: true,
                    attributes: {
                        exclude: ["updatedAt", "createdAt", "deletedAt", "time_id", "regravalidacoe_id", "estrategia_id"]
                    }
                }
            });

            return { count, rows };

        } catch (error) {
            console.log(error);
        }
    }

    async getEstrategia(estrategiaID) {
        const convertStringToArray = (stringValue) => {
            return stringValue ? stringValue.split(',').map(Number) : [];
        };

        const estrategiaSequelize = await super.pegaUmRegistro({
            where: { id: estrategiaID },
            attributes: {
                exclude: ["updatedAt", "createdAt", "deletedAt"]
            },
            include: [{
                model: Regra,
                required: true,
                attributes: {
                    exclude: ["updatedAt", "createdAt", "deletedAt", "estrategia_id"]
                },
                include: [
                    {
                        model: Regravalidacoe,
                        as: 'regra1',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "regra"] },
                        include: {
                            model: Tipoaposta,
                            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                        }
                    },
                    {
                        model: Regravalidacoe,
                        as: 'regra2',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "regra"] },
                        include: {
                            model: Tipoaposta,
                            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                        }
                    },
                    {
                        model: Regravalidacoe,
                        as: 'regra3',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "regra"] },
                        include: {
                            model: Tipoaposta,
                            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                        }
                    },
                    /*{
                        model: Filtrojogo,
                        as: 'filtroGeral',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "sql"] }
                    },
                    {
                        model: Filtrojogo,
                        as: 'filtroCasa',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "sql"] }
                    },
                    {
                        model: Filtrojogo,
                        as: 'filtroFora',
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "sql"] }
                    }*/
                ]
            },
            ],
        });

        const estrategia = estrategiaSequelize ? estrategiaSequelize.toJSON() : null;

        if (!estrategia) {
            return null;
        }

        const regras = estrategia.Regras || [];

        const regraCompleta = [];
        for (const regra of regras) {
            if (regra.liga_id) {
                const Ligas = await Liga.findAll({
                    where: { id: { [Op.in]: convertStringToArray(regra.liga_id) } },
                    attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                });
                regra.Ligas = Ligas;
                delete regra.liga_id;
            }
            if (regra.pai_id) {
                const Pais = await Pai.findAll({
                    where: { id: { [Op.in]: convertStringToArray(regra.pai_id) } },
                    attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                });
                regra.Pais = Pais;
                delete regra.pai_id;
            }
            if (regra.time_id) {
                const Times = await Time.findAll({
                    where: { id: { [Op.in]: convertStringToArray(regra.time_id) } },
                    attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                });
                regra.Times = Times;
                delete regra.time_id;
            }
            regraCompleta.push(regra);
        }

        estrategia.Regras = regraCompleta;

        return estrategia;
    }

    async getTopEstrategia() {
        const estrategia = await super.pegaUmRegistro({
            where: { taxaacerto: { [Op.ne]: null }, lucro_total: { [Op.gte]: 0 } },
            order: [['lucro_total', 'DESC']],
            attributes: {
                exclude: ["grafico_json", "updatedAt", "createdAt", "deletedAt"]
            },
            include: {
                model: Regra,
                require: true,
                attributes: {
                    exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "liga_id", "temporada_id", "time_id", "regravalidacoe_id", "estrategia_id"]
                }
            }
        });
        return estrategia;
    }

    async geraEstistica(estrategia, salvaNoBanco = true) {
        var bilhetes = [];
        if (estrategia instanceof Estrategia) {
            bilhetes = await estrategia.getBilhetes({
                attributes: [
                    'status_bilhete',
                    'odd',
                    'data',
                    'valor_aposta',
                ],
                where: {
                    status_bilhete: {
                        [Op.not]: null
                    }
                }
            });
        } else {
            bilhetes = estrategia.bilhetes;
        }

        if (bilhetes.length === 0) {
            throw new Error('Estratégia não contém bilhetes!');
        }

        try {
            // Inicialize as estatísticas da estratégia
            estrategia.total_apostas = bilhetes.length;
            estrategia.totalacerto = 0;
            estrategia.totalerro = 0;
            estrategia.odd_total = 0;
            estrategia.odd_minima = Infinity;
            estrategia.odd_maxima = -Infinity;
            estrategia.total_vitorias = 0;
            estrategia.total_derrotas = 0;
            estrategia.lucro_total = 0;
            estrategia.media_odd_vitoriosa = 0;
            estrategia.media_odd_derrotada = 0;
            estrategia.media_sequencia_vitorias = 0;
            estrategia.maior_derrotas_dia = 0;
            estrategia.maior_derrotas_semana = 0;
            estrategia.maior_vitorias_dia = 0;
            estrategia.maior_vitorias_semana = 0;
            estrategia.sequencia_vitorias = 0; // Initialize to 0
            estrategia.sequencia_derrotas = 0; // Initialize to 0
            estrategia.media_aposta = 0; // Initialize to 0

            let sequenciaAtualVitoria = 0;
            let sequenciaAtualDerrota = 0;
            let somaOddVitoriosa = 0;
            let somaOddDerrotada = 0;
            let countVitoriosa = 0;
            let countDerrotada = 0;
            let dias = {};
            let semanas = {};
            let sequenciasVitoria = []; // Armazena todas as sequências de vitórias para calcular a média posteriormente

            bilhetes.forEach(bilhete => {
                let { odd, status_bilhete, data } = bilhete;

                odd = Number(odd);
                estrategia.odd_total += odd;
                estrategia.odd_minima = Math.min(estrategia.odd_minima, odd);
                estrategia.odd_maxima = Math.max(estrategia.odd_maxima, odd);

                if (!(data instanceof Date)) data = new Date(data)
                const dia = data.toISOString().split('T')[0];
                const semana = `${data.getUTCFullYear()}-W${Math.ceil((data.getUTCDate() - data.getUTCDay()) / 7)}`;

                // Controle de frequência por dia e semana
                dias[dia] = dias[dia] || { vitorias: 0, derrotas: 0 };
                semanas[semana] = semanas[semana] || { vitorias: 0, derrotas: 0 };

                if (status_bilhete) {
                    estrategia.totalacerto++;
                    estrategia.total_vitorias++;
                    dias[dia].vitorias++;
                    semanas[semana].vitorias++;

                    sequenciaAtualVitoria++;
                    sequenciaAtualDerrota = 0;

                    estrategia.lucro_total += (odd - 1) * bilhete.valor_aposta; // ajustado conforme o cálculo de lucro desejado
                    somaOddVitoriosa += odd;
                    countVitoriosa++;
                } else {
                    estrategia.totalerro++;
                    estrategia.total_derrotas++;
                    dias[dia].derrotas++;
                    semanas[semana].derrotas++;

                    sequenciaAtualDerrota++;
                    if (sequenciaAtualVitoria > 0) {
                        sequenciasVitoria.push(sequenciaAtualVitoria); // Armazene a sequência de vitórias antes de zerar
                        sequenciaAtualVitoria = 0;
                    }

                    estrategia.lucro_total -= bilhete.valor_aposta; // ajustado conforme o cálculo de lucro desejado
                    somaOddDerrotada += odd;
                    countDerrotada++;
                }

                estrategia.sequencia_vitorias = Math.max(estrategia.sequencia_vitorias, sequenciaAtualVitoria);
                estrategia.sequencia_derrotas = Math.max(estrategia.sequencia_derrotas, sequenciaAtualDerrota);
            });

            if (sequenciaAtualVitoria > 0) sequenciasVitoria.push(sequenciaAtualVitoria); // Adicione a última sequência de vitórias, se houver

            // Cálculos finais
            estrategia.taxaacerto = ((estrategia.totalacerto / estrategia.total_apostas) * 100).toFixed(2);
            estrategia.odd_media = (estrategia.odd_total / estrategia.total_apostas).toFixed(2);;
            estrategia.media_odd_vitoriosa = countVitoriosa > 0 ? (somaOddVitoriosa / countVitoriosa).toFixed(2) : 0;
            estrategia.media_odd_derrotada = countDerrotada > 0 ? (somaOddDerrotada / countDerrotada).toFixed(2) : 0;
            // Corrigir cálculo da frequência de apostas por dia
            const totalApostasPorDia = Object.values(dias).reduce((total, dia) => total + dia.vitorias + dia.derrotas, 0);
            estrategia.frequencia_apostas_dia = (totalApostasPorDia / Object.keys(dias).length).toFixed(2);
            estrategia.media_sequencia_vitorias = sequenciasVitoria.length > 0 ? (sequenciasVitoria.reduce((a, b) => a + b, 0) / sequenciasVitoria.length).toFixed(2) : 0;

            // Maior número de vitórias e derrotas em um único dia
            estrategia.maior_vitorias_dia = Math.max(...Object.values(dias).map(d => d.vitorias));
            estrategia.maior_derrotas_dia = Math.max(...Object.values(dias).map(d => d.derrotas));

            // Maior número de vitórias e derrotas em uma única semana
            estrategia.maior_vitorias_semana = Math.max(...Object.values(semanas).map(s => s.vitorias));
            estrategia.maior_derrotas_semana = Math.max(...Object.values(semanas).map(s => s.derrotas));

            // Calcular a média do valor das apostas
            const somaValorAposta = bilhetes.reduce((total, bilhete) => total + Number(bilhete.valor_aposta), 0);
            estrategia.total_apostado = somaValorAposta.toFixed(2);
            estrategia.media_aposta = (somaValorAposta / bilhetes.length).toFixed(2);

            estrategia.lucro_total = estrategia.lucro_total.toFixed(2);
            if (salvaNoBanco) {
                estrategia.save();
            }

            return estrategia;
        } catch (error) {
            console.log(error)
            console.error('EstrategiaServices:', error.message);
        }

    }
}

module.exports = EstrategiaServices;