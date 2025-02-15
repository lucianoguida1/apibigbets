const Services = require('./Services.js');
const { Estrategia, Bilhete, Odd, sequelize } = require('../database/models');


const JogoServices = require('./JogoServices.js');
const jogoServices = new JogoServices();



class BilheteServices extends Services {
    constructor() {
        super('Bilhete');
    }

    async getBilhetesGrafico(estrategia) {
        try {
            if (!estrategia.id) {
                return new Error('Estrategia invalida!');
            }

            const sql = `
                SELECT 
                b.data::DATE AS data,
                count(b.data) as num_bilhetes,
                SUM(CASE WHEN b.status_bilhete = true THEN 1 ELSE 0 END) AS bilhetes_ganhos, -- Contagem de bilhetes ganhos
                SUM(CASE WHEN b.status_bilhete = false THEN 1 ELSE 0 END) AS bilhetes_perdidos, -- Contagem de bilhetes perdidos
                ROUND(
                    CAST(
                        SUM(
                            CASE 
                                WHEN b.status_bilhete = true THEN (b.odd - 1) * 1 -- Lucro por bilhete ganho
                                ELSE 0
                            END
                        ) AS NUMERIC
                    ), 2
                ) AS lucro, -- Lucro total (apenas para bilhetes ganhos)
                ROUND(
                    CAST(
                        SUM(
                            CASE 
                                WHEN b.status_bilhete = false THEN -1 -- Prejuízo por bilhete perdido
                                ELSE 0
                            END
                        ) AS NUMERIC
                    ), 2
                ) AS prejuizo, -- Prejuízo total (apenas para bilhetes perdidos)
                ROUND(
                    CAST(
                        SUM(
                            CASE 
                                WHEN b.status_bilhete = true THEN (b.odd - 1) * 1 -- Lucro por bilhete ganho
                                ELSE 0
                            END
                        ) AS NUMERIC
                    ) - 
                    CAST(
                        SUM(
                            CASE 
                                WHEN b.status_bilhete = false THEN 1 -- Prejuízo por bilhete perdido
                                ELSE 0
                            END
                        ) AS NUMERIC
                    ), 2
                ) AS saldo_dia -- Saldo calculado como (lucro - prejuizo)
            FROM 
                (select b.bilhete_id,estrategia_id,data,status_bilhete,odd 
                from bilhetes b where status_bilhete is not null
                group by b.bilhete_id,estrategia_id,data,status_bilhete,odd) b
            WHERE 
                b.estrategia_id = $1
                AND b.status_bilhete IS NOT NULL
            GROUP BY 
                b.data::DATE
            ORDER BY 
                b.data::DATE ASC;

            `;

            const results = await sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                bind: [estrategia.id],
            });

            return results;

        } catch (error) {
            return new Error('Erro ao gerar bilhetes do Gráfico!')
        }
    }

    async montaBilhetes(estrategia, novosJogos = false, salvaNoBanco = true) {
        // Verifica se a estratégia foi passada
        if (!estrategia) {
            throw new Error('Estratégia não encontrada!');
        }

        // Obtém as regras associadas à estratégia
        var regras = null;
        if (estrategia instanceof Estrategia) {
            regras = await estrategia.getRegras();
        } else {
            regras = estrategia.regras;
        }
        if (!regras || regras.length === 0) {
            throw new Error('Estratégia não contém regras!');
        }
        const jogosUnicos = await jogoServices.filtrarJogosUnicos(regras, novosJogos);
        if (jogosUnicos.length === 0) {
            throw new Error('Nenhum jogo encontrado!');
        }
        if (jogosUnicos.length < regras.length) {
            throw new Error('Quantidade de jogos insuficiente!');
        }
        try {
            let apostas = {};
            const bilhetesCriar = [];
            let i = await Bilhete.max('bilhete_id') || 1;
            i++;

            const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(a.datahora) - new Date(b.datahora));

            for (const jogo of jogosArray) {
                if (!apostas[i]) {
                    apostas[i] = { odd: 1, status: true, jogos: [] };
                }
                bilhetesCriar.push({
                    bilhete_id: i,
                    jogo_id: jogo.id,
                    estrategia_id: estrategia.id,
                    odd_id: jogo.odd_id,
                    status_jogo: jogo.statusodd,
                });

                apostas[i].jogos.push(jogo);
                apostas[i].odd *= jogo.odd;

                if (apostas[i].jogos.length >= regras.length || jogo === jogosArray.at(-1)) {
                    const algumStatusNulo = apostas[i].jogos.some((j) => j.statusodd === null);
                    apostas[i].status = algumStatusNulo ? null : apostas[i].jogos.every((j) => j.statusodd === true);
                    bilhetesCriar.forEach(bilhete => {
                        if (bilhete.bilhete_id === i) {
                            bilhete.status_bilhete = apostas[i].status;
                            bilhete.odd = apostas[i].odd.toFixed(2);
                            bilhete.data = jogo.data;
                        }
                    });
                    i++;
                }
            }

            if (salvaNoBanco) {
                const bilhetes = await this.criaVariosRegistros(bilhetesCriar);
                return bilhetes;
            }

            return { bilhetes: bilhetesCriar, jogos: jogosArray };
        } catch (error) {
            console.error('BilhetesServices:', error.message);
        }
    }

    async getBilhetes(options = {}, estrategiaOptions = {}) {
        try {
            const bilhetes = await Bilhete.findAll({
                ...options,
                include: [
                    {
                        model: Estrategia,
                        required: true,
                        ...estrategiaOptions
                    },
                    {
                        model: Odd,
                        required: true,
                    }
                ],
            });

            return bilhetes;
        } catch (error) {
            console.error('BilheteServices:', error.message);
            throw new Error('Erro ao buscar bilhetes!');
        }
    }
}

module.exports = BilheteServices;
