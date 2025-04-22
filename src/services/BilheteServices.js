const Services = require('./Services.js');
const { Estrategia, Bilhete, Odd, Bilhetesodd, Jogo, Time, Tipoaposta, Regravalidacoe, sequelize } = require('../database/models');


const JogoServices = require('./JogoServices.js');
const e = require('express');
const { es } = require('date-fns/locale');
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
                    bilhete_id: i,
                    estrategia_id: estrategia.id,
                    odd: jogo.odd,
                    data: jogo.data,
                    status_bilhete: jogo.statusodd,
                    valor_aposta: 1,
                    bilhetesodd: [{
                        odd_id: jogo.odd_id,
                        bilhete_id: null,
                        status_odd: jogo.statusodd,
                        regra_id: jogo.regra_id,
                        data: jogo.data
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
                                data: jogoMesmoDia.data
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

            if (estrategia.kelly || estrategia.filtro_kelly) {
                let valorAposta = 1;
                let acerto = 0;
                let erro = 0;
                bilhetesCriar.forEach((bilhete, index) => {
                    if (bilhete.status_bilhete !== null) {
                        acerto += bilhete.status_bilhete ? 1 : 0;
                        erro += bilhete.status_bilhete ? 0 : 1;
                    }
                    let probabilidade = 0;
                    if (estrategia.taxaacerto && estrategia.taxaacerto > 0) {
                        probabilidade = estrategia.taxaacerto;
                    } else {
                        probabilidade = (acerto + erro) > 10 ? (acerto / (acerto + erro) * 100) : 30;
                    }

                    // Converte probabilidade percentual para decimal (ex: 55% → 0.55)
                    const p = probabilidade / 100;
                    const o = bilhete.odd;

                    const kelly = ((p * (o - 1)) - (1 - p)) / (o - 1);

                    // Se o kelly for negativo, não deve apostar
                    const fracao = kelly > 0 ? kelly : 0;
                    valorAposta = fracao * 100;
                    const filtro_kelly = kelly > 0 ? true : false;

                    if (estrategia.kelly) {
                        bilhetesCriar[index].valor_aposta = (valorAposta < 1 ? 1 : valorAposta).toFixed(2);
                    }

                    if (estrategia.filtro_kelly && !filtro_kelly) {
                        bilhetesCriar.splice(index, 1);
                    }
                });

            }

            if (salvaNoBanco) {
                const bilhetes = [];

                for (const bilhete of bilhetesCriar) {
                    const existe = await sequelize.query(
                        `SELECT b.id FROM bilhetes b
                            JOIN bilhetesodds bo ON bo.bilhete_id = b.id
                            WHERE b.estrategia_id = :estrategia_id AND bo.odd_id = :odd_id
                            LIMIT 1`, {
                        replacements: {
                            estrategia_id: bilhete.estrategia_id,
                            odd_id: bilhete.bilhetesodd[0].odd_id,
                        },
                        type: sequelize.QueryTypes.SELECT,
                    });

                    // Se já existe, pula para o próximo
                    if (existe.length > 0) continue;

                    // Caso contrário, cria normalmente
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
            console.error('BilhetesServices:', error);
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
                                order: [['id', 'DESC']],
                                include: [
                                    {
                                        model: Jogo,
                                        attributes: ['id', 'datahora', 'gols_casa', 'gols_fora', 'adiado'],
                                        include: [
                                            {
                                                model: Time,
                                                as: 'casa',
                                                attributes: ['id', 'nome', 'logo', 'dados_json']
                                            },
                                            {
                                                model: Time,
                                                as: 'fora',
                                                attributes: ['id', 'nome', 'logo', 'dados_json']
                                            }
                                        ]
                                    }, {
                                        model: Tipoaposta,
                                        required: true,
                                    },
                                    {
                                        model: Regravalidacoe,
                                        as: 'regra',
                                        required: true,
                                        attributes: ['id', 'nome', 'name']
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
