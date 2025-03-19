const Services = require('./Services.js');
const { Estrategia, Bilhete, Odd, Bilhetesodd, Jogo, Time, Tipoaposta, Regravalidacoe, sequelize } = require('../database/models');


const JogoServices = require('./JogoServices.js');
const e = require('express');
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
        } else if (jogosUnicos.length > 500 && !salvaNoBanco) {
            jogosUnicos.splice(0, jogosUnicos.length - 350000);
        }

        if (jogosUnicos.length < regras.length) {
            throw new Error('Quantidade de jogos insuficiente!');
        }

        try {
            let i = 0;
            let bilhetesCriar = [];
            for (const jogo of jogosUnicos) {
                if (bilhetesCriar.some(b => b.bilhetesodd.some(o => o.odd_id === jogo.odd_id))) {
                    jogosUnicos.splice(jogosUnicos.indexOf(jogo), 1);
                    continue;
                }
                bilhetesCriar[i] = {
                    estrategia_id: estrategia.id,
                    odd: jogo.odd,
                    data: jogo.data,
                    status_bilhete: jogo.statusodd,
                    bilhetesodd: [{
                        odd_id: jogo.odd_id,
                        bilhete_id: null,
                        status_odd: jogo.statusodd,
                        regra_id: jogo.regra_id,
                    }]
                }


                if (regras.length > 1) {
                    const jogosMesmoDia = jogosUnicos.filter(j => j.data === jogo.data);
                    for (const jogoMesmoDia of jogosMesmoDia) {
                        if (bilhetesCriar.some(b => b.bilhetesodd.some(o => o.odd_id === jogoMesmoDia.odd_id))) {
                            continue;
                        }
                        if (jogoMesmoDia.regra_id &&
                            regras.length > bilhetesCriar[i].bilhetesodd.length &&
                            !bilhetesCriar[i].bilhetesodd.some(b => b.regra_id === jogoMesmoDia.regra_id || b.odd_id === jogoMesmoDia.odd_id)) {
                            bilhetesCriar[i].bilhetesodd.push({
                                odd_id: jogoMesmoDia.odd_id,
                                bilhete_id: null,
                                status_odd: jogoMesmoDia.statusodd,
                                regra_id: jogoMesmoDia.regra_id,
                            });
                            bilhetesCriar[i].odd *= jogoMesmoDia.odd;
                        }
                        const statusBilhete = bilhetesCriar[i].bilhetesodd.reduce((status, item) => {
                            if (item.status_odd === false) return false;
                            if (item.status_odd === null && status !== false) return null;
                            return status;
                        }, true);
                        bilhetesCriar[i].status_bilhete = statusBilhete;
                        if (regras.length == bilhetesCriar[i].bilhetesodd.length) break;
                    }
                }
                i++;
            }

            if (salvaNoBanco) {
                //salvar no banco de forma lenta
                const bilhetes = [];
                for (const bilhete of bilhetesCriar) {
                    const bilheteSalvo = await this.criaRegistro(bilhete);
                    bilhetes.push(bilheteSalvo);
                    for (const bilheteOdd of bilhete.bilhetesodd) {
                        bilheteOdd.bilhete_id = bilheteSalvo.id;
                        await Bilhetesodd.create(bilheteOdd);
                    }
                }
                return bilhetes;
            }

            return { bilhetes: bilhetesCriar, jogos: jogosUnicos };
        } catch (error) {
            console.error('BilhetesServices:', error.message);
        }
    }

    async getBilhetes(options = {}) {
        try {
            const { count, rows } = await Estrategia.findAndCountAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: options.where,
                include: [
                    {
                        model: Bilhete,
                        required: true,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        offset: options.offset,
                        limit: options.limit,
                        order: [['id', 'DESC']], // Ordena pelo campo id em ordem ascendente
                        include: [
                            {
                                model: Odd,
                                required: true,
                                attributes: ['id', 'odd', 'status', 'nome'],
                                include: [
                                    {
                                        model: Jogo,
                                        attributes: ['id', 'datahora', 'gols_casa', 'gols_fora'],
                                        include: [
                                            {
                                                model: Time,
                                                as: 'casa',
                                                attributes: ['id', 'nome', 'logo']
                                            },
                                            {
                                                model: Time,
                                                as: 'fora',
                                                attributes: ['id', 'nome', 'logo']
                                            }
                                        ]
                                    }, {
                                        model: Tipoaposta,
                                        required: true,
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            return { count, bilhetes: rows[0] }
        } catch (error) {
            console.error('BilheteServices:', error);
            throw new Error('Erro ao buscar bilhetes!:' + error.message);
        }
    }

    async getBilhetesFromMsg(options = {}, estrategiaOptions = {}) {
        try {
            const { count, rows } = await Bilhete.findAndCountAll({
                ...options,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: [
                    {
                        model: Estrategia,
                        required: true,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        ...estrategiaOptions,
                    },
                    {
                        model: Odd,
                        required: true,
                        attributes: ['id', 'odd', 'status', 'nome'],
                        include: [
                            {
                                model: Jogo,
                                attributes: ['id', 'datahora', 'gols_casa', 'gols_fora'],
                                include: [
                                    {
                                        model: Time,
                                        as: 'casa',
                                        attributes: ['id', 'nome', 'logo']
                                    },
                                    {
                                        model: Time,
                                        as: 'fora',
                                        attributes: ['id', 'nome', 'logo']
                                    }
                                ]
                            },
                            {
                                model: Tipoaposta,
                                required: true,
                                attributes: ['id', 'nome', 'name']
                            },
                            {
                                model: Regravalidacoe,
                                as: 'regra',
                                required: true,
                                attributes: ['id', 'nome', 'name']
                            }
                        ]
                    }
                ],
            });
            return { count, bilhetes: rows }
        } catch (error) {
            console.error('BilheteServices:', error);
            throw new Error('Erro ao buscar bilhetes!:' + error.message);
        }
    }
}

module.exports = BilheteServices;
