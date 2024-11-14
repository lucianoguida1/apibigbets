const { Op } = require('sequelize');
//const { startOfWeek } = require('date-fns');
const Services = require('./Services.js');
const { Regra, Regravalidacoe, Tipoaposta, Pai, Liga, Time, Bilhete, Jogo, Odd } = require('../database/models');
//const JogoServices = require('./JogoServices');
//const BilheteServices = require('./BilheteServices.js');

//const bilheteServices = new BilheteServices();
//const jogoServices = new JogoServices();

class EstrategiaServices extends Services {
    constructor() {
        super('Estrategia');
    }
    async getEstrategia(estrategiaID) {
        const estrategia = await super.pegaUmRegistro({
            where: { id: estrategiaID },
            attributes: {
                exclude: ["grafico_json", "updatedAt", "createdAt", "deletedAt"]
            },
            include: {
                model: Regra,
                require: true,
                attributes: {
                    exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "liga_id", "temporada_id", "time_id", "regravalidacoe_id", "estrategia_id"]
                },
                include: [
                    { model: Pai, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt"] }, },             // Associação com Pai
                    { model: Liga, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt"] }, },            // Associação com Liga
                    { model: Time, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt"] }, },            // Associação com Time
                    {
                        model: Regravalidacoe,
                        require: true,
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "regra"] },
                        include: {
                            model: Tipoaposta,
                            require: true,
                            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                        }
                    }
                ]
            }
        });
        return estrategia;
    }

    async getBilhetes(EstrategiaID, page = 1, pageSize = null, order = "DESC") {
        const options = {
            where: { id: EstrategiaID },
            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "grafico_json"] },
            include: {
                model: Bilhete,
                required: false,
                order: [['id', order]],
                attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "jogo_id", "estrategia_id", "odd_id", "data",] },
                include: [
                    {
                        model: Jogo,
                        required: true,
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "bilhete_id", "casa_id", "fora_id", "temporada_id", "id_sports", "halftime", "fulltime", "extratime", "penalty"] },
                        where: {
                            //gols_casa: { [Op.ne]: null }
                        },
                        include: [
                            {
                                model: Time,
                                attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "id_sports"] },
                                as: 'casa',
                                required: true,
                            },
                            {
                                model: Time,
                                attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "id_sports"] },
                                as: 'fora',
                                required: true,
                            }
                        ]
                    },
                    {
                        model: Odd,
                        required: false,
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "jogo_id", "bet_id", "regra_id"] },
                        include: { model: Tipoaposta, required: true, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] } }
                    },
                ]
            }
        };

        // Aplica paginação somente se `pageSize` for definido
        if (pageSize) {
            options.include.limit = pageSize;
            options.include.offset = (page - 1) * pageSize;
        }

        const estrategia = await super.pegaUmRegistro(options);
        return estrategia;
    }

    async getTopEstrategia() {
        const estrategia = await super.pegaUmRegistro({
            where: { taxaacerto: { [Op.ne]: null } },
            order: [['taxaacerto', 'DESC']],
            attributes: {
                exclude: ["grafico_json", "updatedAt", "createdAt", "deletedAt"]
            },
            include: {
                model: Regra,
                require: true,
                attributes: {
                    exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "liga_id", "temporada_id", "time_id", "regravalidacoe_id", "estrategia_id"]
                },
                include: [
                    { model: Pai, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt"] }, },             // Associação com Pai
                    { model: Liga, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt"] }, },            // Associação com Liga
                    { model: Time, required: false, attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "pai_id", "id_sports"] }, },            // Associação com Time
                    {
                        model: Regravalidacoe,
                        require: true,
                        attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "tipoaposta_id", "regra"] },
                        include: {
                            model: Tipoaposta,
                            require: true,
                            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "id_sports"] },
                        }
                    }
                ]
            }
        });
        return estrategia;
    }


    async geraEstistica(estrategia) {
        const bilhetes = await estrategia.getBilhetes({
            attributes: [
                'bilhete_id',
                'status_bilhete',
                'odd',
                'data'
            ],
            group: ['bilhete_id', 'status_bilhete', 'odd', 'data']
        });

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
                const { odd, status_bilhete, data } = bilhete.dataValues;

                estrategia.odd_total += odd;
                estrategia.odd_minima = Math.min(estrategia.odd_minima, odd);
                estrategia.odd_maxima = Math.max(estrategia.odd_maxima, odd);

                const isVitoria = status_bilhete; // Supondo que `true` é vitória e `false` é derrota

                const dia = data.toISOString().split('T')[0];
                const semana = `${data.getUTCFullYear()}-W${Math.ceil((data.getUTCDate() - data.getUTCDay()) / 7)}`;

                // Controle de frequência por dia e semana
                dias[dia] = dias[dia] || { vitorias: 0, derrotas: 0 };
                semanas[semana] = semanas[semana] || { vitorias: 0, derrotas: 0 };

                if (isVitoria) {
                    estrategia.totalacerto++;
                    estrategia.total_vitorias++;
                    dias[dia].vitorias++;
                    semanas[semana].vitorias++;

                    sequenciaAtualVitoria++;
                    sequenciaAtualDerrota = 0;

                    estrategia.lucro_total += (odd - 1); // ajustado conforme o cálculo de lucro desejado
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

                    estrategia.lucro_total -= 1; // ajustado conforme o cálculo de lucro desejado
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
            estrategia.frequencia_apostas_dia = Object.keys(dias).length;
            estrategia.media_sequencia_vitorias = sequenciasVitoria.length > 0 ? (sequenciasVitoria.reduce((a, b) => a + b, 0) / sequenciasVitoria.length).toFixed(2) : 0;

            // Maior número de vitórias e derrotas em um único dia
            estrategia.maior_vitorias_dia = Math.max(...Object.values(dias).map(d => d.vitorias));
            estrategia.maior_derrotas_dia = Math.max(...Object.values(dias).map(d => d.derrotas));

            // Maior número de vitórias e derrotas em uma única semana
            estrategia.maior_vitorias_semana = Math.max(...Object.values(semanas).map(s => s.vitorias));
            estrategia.maior_derrotas_semana = Math.max(...Object.values(semanas).map(s => s.derrotas));

            estrategia.lucro_total = estrategia.lucro_total.toFixed(2);
            estrategia.save();

            return estrategia;
        } catch (error) {
            console.error('EstrategiaServices:', error.message);
        }

    }
}

module.exports = EstrategiaServices;