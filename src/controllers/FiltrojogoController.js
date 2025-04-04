const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const Filtrojogos = require('../services/FiltrojogoServices.js');
const { sequelize } = require('../database/models');
const { z } = require('zod'); // Certifique-se de que o zod está instalado

const filtrojogos = new Filtrojogos();


const formSchema = z
    .object({
        nome: z.string().min(5, { message: "O nome deve ter pelo menos 5 caracteres." }),
        casa: z.boolean().default(true).optional(),
        fora: z.boolean().default(true).optional(),
        minimoJogos: z.preprocess((val) => Number(val), z.number().positive()
            .min(1, {
                message: "O valor mínimo deve ser pelo menos 1.",
            })
            .max(10, {
                message: "O valor máximo não deve ser maior que 10.",
            })).optional(),
        maximoJogos: z.preprocess((val) => Number(val), z.number().positive()
            .min(1, {
                message: "O valor mínimo deve ser pelo menos 1.",
            })
            .max(10, {
                message: "O valor máximo não deve ser maior que 10.",
            })).optional(),
        where: z.string().min(5, { message: "O campo 'Quando' deve ser preenchido." }),
    })
    .refine((data) => data.casa || data.fora, {
        message: "Pelo menos um dos campos 'Jogos em casa' ou 'Jogos fora' deve ser marcado.",
        path: ["casa", "fora"],
    });

class FiltrojogoController extends Controller {
    async getFiltrosJogos(req, res) {
        try {
            const { page = 1, limit = 1000 } = req.query;
            const offset = (page - 1) * limit;

            // Buscar registros com filtros aplicados e limite
            const filtrosJogos = await filtrojogos.getFiltrosJogos({ offset, limit });

            if (!filtrosJogos) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Filtros de jogos não encontrados",
                    "errorCode": 404,
                    "pagination": {}
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "Filtros de jogos encontrados com sucesso!",
                "statusCode": 200,
                "pagination": {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filtrosJogos.length,
                },
                data: filtrosJogos
            });
        } catch (error) {
            console.error('Erro ao buscar filtros de jogos:', error);
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar filtros de jogos",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async testFiltroJogo(req, res) {
        try {
            const validation = formSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    status: "error",
                    message: "Erro de validação",
                    errorCode: 400,
                    details: validation.error.errors
                });
            }

            const { where, minimoJogos, maximoJogos } = req.body;

            let sql = `WITH ultimos_jogos AS (SELECT t.*, ROW_NUMBER() OVER (PARTITION BY t.time_id ORDER BY t.data DESC) AS rn FROM (SELECT casa_id AS time_id, * FROM jogos UNION ALL SELECT fora_id AS time_id, * FROM jogos) t WHERE gols_casa IS NOT NULL AND data::DATE <= (@data::date - INTERVAL '1 day') ORDER BY data DESC) INSERT INTO filtrojogodata(data, time_id, filtrojogo_id) SELECT @data, time_id, @filtrojogoid AS filtrojogo_id FROM (SELECT time_id, COUNT(*) AS total_jogos, SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END) AS total_jogos_casa, SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END) AS total_jogos_fora, SUM(CASE WHEN (time_id = casa_id AND gols_casa > gols_fora) OR (time_id = fora_id AND gols_fora > gols_casa) THEN 1 ELSE 0 END) AS total_vitorias, SUM(CASE WHEN (time_id = casa_id AND gols_casa < gols_fora) OR (time_id = fora_id AND gols_fora < gols_casa) THEN 1 ELSE 0 END) AS total_derrotas, SUM(CASE WHEN gols_casa = gols_fora THEN 1 ELSE 0 END) AS total_empates, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_casa > gols_fora) OR (time_id = fora_id AND gols_fora > gols_casa) THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_vitoria, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_casa < gols_fora) OR (time_id = fora_id AND gols_fora < gols_casa) THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_derrota, ROUND(100.0 * SUM(CASE WHEN gols_casa = gols_fora THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_empate_geral, ROUND(100.0 * SUM(CASE WHEN time_id = casa_id AND gols_casa = gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END), 0), 2) AS taxa_empate_casa, ROUND(100.0 * SUM(CASE WHEN time_id = fora_id AND gols_casa = gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END), 0), 2) AS taxa_empate_fora, ROUND(100.0 * SUM(CASE WHEN time_id = casa_id AND gols_casa > gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END), 0), 2) AS taxa_vitoria_casa, ROUND(100.0 * SUM(CASE WHEN time_id = fora_id AND gols_fora > gols_casa THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END), 0), 2) AS taxa_vitoria_fora, ROUND(AVG(CASE WHEN time_id = casa_id THEN gols_casa ELSE NULL END), 2) AS media_gols_casa, ROUND(AVG(CASE WHEN time_id = fora_id THEN gols_fora ELSE NULL END), 2) AS media_gols_fora, ROUND(AVG(CASE WHEN time_id = fora_id OR time_id = casa_id THEN gols_fora ELSE NULL END), 2) AS media_gols_geral, ROUND(AVG(CASE WHEN time_id = casa_id THEN gols_fora ELSE NULL END), 2) AS media_gols_sofridos_casa, ROUND(AVG(CASE WHEN time_id = fora_id THEN gols_casa ELSE NULL END), 2) AS media_gols_sofridos_fora, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_fora = 0) OR (time_id = fora_id AND gols_casa = 0) THEN 1 ELSE 0 END) / COUNT(*), 2) AS percentual_jogos_sem_sofrer_gol, ROUND(100.0 * SUM(CASE WHEN gols_casa > 0 AND gols_fora > 0 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_ambas_marcam, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 1.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_1_5, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 2.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_2_5, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 3.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_3_5 FROM ultimos_jogos WHERE rn <= @maximoJogos GROUP BY time_id HAVING COUNT(*) >= @minimoJogos) TB1 WHERE @where`;
            sql = sql.replace(/@minimoJogos/g, minimoJogos);
            sql = sql.replace(/@maximoJogos/g, maximoJogos);
            sql = sql.replace(/@where/g, where);


            // Verifica se a consulta SQL está funcioanndo perfeitamente
            let sqlt = sql
            sqlt = sqlt.replace(/INSERT INTO filtrojogodata\(data, time_id, filtrojogo_id\)/, '');
            sqlt = sqlt.replace(/@data/g, `NOW()`);
            sqlt = sqlt.replace(/@filtrojogoid/g, `'0'`);

            const filtrojogo = await sequelize.query(sqlt, {
                type: sequelize.QueryTypes.SELECT
            });

            if (!filtrojogo) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi possivel criar o filtro de jogo",
                    "errorCode": 400,
                    "pagination": {},
                    "data": {
                        "details": "Não foi possível criar o filtro de jogo"
                    }
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "filtro de jogos criado com sucesso!",
                "statusCode": 200,
                "pagination": {},
                data: {
                    Qtde_jogos: filtrojogo.length,
                    dados_json: filtrojogo
                }
            });
        } catch (error) {
            console.error('Erro ao criar filtro de jogo:', error);
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao criar filtro de jogo",
                "errorCode": 500,
                "details": error.message
            });
        }
    }


    async createFiltroJogo(req, res) {
        try {

            const validation = formSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    status: "error",
                    message: "Erro de validação",
                    errorCode: 400,
                    details: validation.error.errors
                });
            }

            const { nome, where, minimoJogos, maximoJogos, casa, fora } = req.body;

            if (!nome || !where || !minimoJogos || !maximoJogos) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Campos obrigatórios estão faltando",
                    "errorCode": 400
                });
            }

            let sql = `WITH ultimos_jogos AS (SELECT t.*, ROW_NUMBER() OVER (PARTITION BY t.time_id ORDER BY t.data DESC) AS rn FROM (SELECT casa_id AS time_id, * FROM jogos UNION ALL SELECT fora_id AS time_id, * FROM jogos) t WHERE gols_casa IS NOT NULL AND data::DATE <= (@data::date - INTERVAL '1 day') ORDER BY data DESC) INSERT INTO filtrojogodata(data, time_id, filtrojogo_id) SELECT @data, time_id, @filtrojogoid AS filtrojogo_id FROM (SELECT time_id, COUNT(*) AS total_jogos, SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END) AS total_jogos_casa, SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END) AS total_jogos_fora, SUM(CASE WHEN (time_id = casa_id AND gols_casa > gols_fora) OR (time_id = fora_id AND gols_fora > gols_casa) THEN 1 ELSE 0 END) AS total_vitorias, SUM(CASE WHEN (time_id = casa_id AND gols_casa < gols_fora) OR (time_id = fora_id AND gols_fora < gols_casa) THEN 1 ELSE 0 END) AS total_derrotas, SUM(CASE WHEN gols_casa = gols_fora THEN 1 ELSE 0 END) AS total_empates, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_casa > gols_fora) OR (time_id = fora_id AND gols_fora > gols_casa) THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_vitoria, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_casa < gols_fora) OR (time_id = fora_id AND gols_fora < gols_casa) THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_derrota, ROUND(100.0 * SUM(CASE WHEN gols_casa = gols_fora THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_empate_geral, ROUND(100.0 * SUM(CASE WHEN time_id = casa_id AND gols_casa = gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END), 0), 2) AS taxa_empate_casa, ROUND(100.0 * SUM(CASE WHEN time_id = fora_id AND gols_casa = gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END), 0), 2) AS taxa_empate_fora, ROUND(100.0 * SUM(CASE WHEN time_id = casa_id AND gols_casa > gols_fora THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = casa_id THEN 1 ELSE 0 END), 0), 2) AS taxa_vitoria_casa, ROUND(100.0 * SUM(CASE WHEN time_id = fora_id AND gols_fora > gols_casa THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN time_id = fora_id THEN 1 ELSE 0 END), 0), 2) AS taxa_vitoria_fora, ROUND(AVG(CASE WHEN time_id = casa_id THEN gols_casa ELSE NULL END), 2) AS media_gols_casa, ROUND(AVG(CASE WHEN time_id = fora_id THEN gols_fora ELSE NULL END), 2) AS media_gols_fora, ROUND(AVG(CASE WHEN time_id = fora_id OR time_id = casa_id THEN gols_fora ELSE NULL END), 2) AS media_gols_geral, ROUND(AVG(CASE WHEN time_id = casa_id THEN gols_fora ELSE NULL END), 2) AS media_gols_sofridos_casa, ROUND(AVG(CASE WHEN time_id = fora_id THEN gols_casa ELSE NULL END), 2) AS media_gols_sofridos_fora, ROUND(100.0 * SUM(CASE WHEN (time_id = casa_id AND gols_fora = 0) OR (time_id = fora_id AND gols_casa = 0) THEN 1 ELSE 0 END) / COUNT(*), 2) AS percentual_jogos_sem_sofrer_gol, ROUND(100.0 * SUM(CASE WHEN gols_casa > 0 AND gols_fora > 0 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_ambas_marcam, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 1.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_1_5, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 2.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_2_5, ROUND(100.0 * SUM(CASE WHEN (gols_casa + gols_fora) > 3.5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS taxa_over_3_5 FROM ultimos_jogos WHERE rn <= @maximoJogos GROUP BY time_id HAVING COUNT(*) >= @minimoJogos) TB1 WHERE @where`;
            sql = sql.replace(/@minimoJogos/g, minimoJogos);
            sql = sql.replace(/@maximoJogos/g, maximoJogos);
            sql = sql.replace(/@where/g, where);


            // Verifica se a consulta SQL está funcioanndo perfeitamente
            let sqlt = sql
            sqlt = sqlt.replace(/INSERT INTO filtrojogodata\(data, time_id, filtrojogo_id\)/, '');
            sqlt = sqlt.replace(/@data/g, `NOW()`);
            sqlt = sqlt.replace(/@filtrojogoid/g, `'0'`);

            await sequelize.query(sqlt, {
                type: sequelize.QueryTypes.SELECT
            });

            const filtrojogo = await filtrojogos.criaRegistro({ nome, sql, casa, fora });

            if (!filtrojogo) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi possível criar o filtro de jogo",
                    "errorCode": 400,
                    "pagination": {}
                });
            }

            if (sql.includes('@data')) {
                const startDate = new Date('2024-09-26');
                const endDate = new Date();
                const dados_json = {};

                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    const formattedDate = d.toISOString().split('T')[0];
                    let sqlF = sql.replace(/@data/g, `'${formattedDate}'`);
                    sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtrojogo.id}'`);

                    const results = await sequelize.query(sqlF, {
                        type: sequelize.QueryTypes.SELECT,
                    });
                    dados_json[formattedDate] = results;
                }

                //filtrojogo.dados_json = dados_json;
                //await filtrojogo.save();
            }

            if (!filtrojogo) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi possivel criar o filtro de jogo",
                    "errorCode": 400,
                    "pagination": {}
                });
            }

            return res.status(201).json({
                "status": "success",
                "message": "filtro de jogos criado com sucesso!",
                "statusCode": 201,
                "pagination": {},
                data: filtrojogo
            });
        } catch (error) {
            console.error('Erro ao criar filtro de jogo:', error);
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao criar filtro de jogo",
                "errorCode": 500,
                "details": error.message
            });
        }
    }
}

module.exports = FiltrojogoController;
