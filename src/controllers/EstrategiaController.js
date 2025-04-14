const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const PaiServices = require('../services/PaiServices.js');
const LigaServices = require('../services/LigaServices.js');
const RegraServices = require('../services/RegraServices.js');
const FiltrojogoServices = require('../services/FiltrojogoServices.js');
const TimeServices = require('../services/TimeServices.js');

const { z } = require('zod');
const { Op } = require('sequelize');
const bilhetesToGrafico = require('../utils/bilhetesToGrafico.js');
const toDay = require('../utils/toDay.js');

const estrategiaServices = new EstrategiaServices();
const bilheteServices = new BilheteServices();
const regravalidacoeServices = new RegravalidacoeServices();
const paiServices = new PaiServices();
const ligaServices = new LigaServices();
const regraServices = new RegraServices();
const filtro = new FiltrojogoServices();
const timeServices = new TimeServices();

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const formSchema = z.object({
    estrategia: z.string().min(5, {
        message: "O nome da estratégia deve ter pelo menos 5 caracteres.",
    }),
    descricao: z.string()
        .min(10, {
            message: "A descrição deve ter pelo menos 10 caracteres.",
        })
        .max(160, {
            message: "A descrição não deve ter mais de 160 caracteres.",
        }),
    liga: z.array(optionSchema),
    pais: z.array(optionSchema),
    filtroTime: z.string(), filtroTime2: z.string(), filtroTime3: z.string(),
    fjcasa: z.string(), fjcasa2: z.string(), fjcasa3: z.string(),
    fjfora: z.string(), fjfora2: z.string(), fjfora3: z.string(),
    times: z.array(optionSchema), times2: z.array(optionSchema), times3: z.array(optionSchema),
    aposta: z.string({ required_error: "Selecione uma aposta." }).min(1, { message: "Selecione pelo menos uma aposta." }),
    oddmin: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })),
    oddmax: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })),
    combase: z.string().optional(),
    coddmin: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })).optional(),
    coddmax: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })).optional(),

    // Multipla 2
    liga2: z.array(optionSchema),
    pais2: z.array(optionSchema),
    aposta2: z.string().optional(),
    oddmin2: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })).optional(),
    oddmax2: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })).optional(),
    combase2: z.string().optional(),
    coddmin2: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })).optional(),
    coddmax2: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })).optional(),

    // Multipla 3
    liga3: z.array(optionSchema),
    pais3: z.array(optionSchema),
    aposta3: z.string().optional(),
    oddmin3: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })).optional(),
    oddmax3: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })).optional(),
    combase3: z.string().optional(),
    coddmin3: z.preprocess((val) => Number(val), z.number().positive()
        .min(1, {
            message: "O valor mínimo deve ser pelo menos 1.",
        })
        .max(5, {
            message: "O valor máximo não deve ser maior que 5.",
        })).optional(),
    coddmax3: z.preprocess((val) => Number(val), z.number().positive()
        .min(1.1, {
            message: "O valor mínimo deve ser pelo menos 1.1.",
        })
        .max(10, {
            message: "O valor máximo não deve ser maior que 10.",
        })).optional(),
})

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async #validaEstrategia(req, res) {
        const { estrategia, descricao, aposta } = req.body;

        // Verificação de campos obrigatórios
        if (!estrategia) {
            res.status(400).json({
                "status": "error",
                "message": "Formulário inválido",
                "errorCode": 400,
                "details": [{
                    path: ['estrategia'],
                    message: ['O nome da estratégia é obrigatório!'],
                }]
            });
            return false;
        }
        if (!aposta || aposta.length < 1) {
            res.status(400).json({
                "status": "error",
                "message": "Formulário inválido",
                "errorCode": 400,
                "details": [{
                    path: ['estrategia'],
                    message: ['O nome da estratégia é obrigatório!'],
                }]
            });
            return false;
        }

        const regras = [];

        for (let i = 1; i <= 3; i++) {
            const aposta = i > 1 ? req.body[`aposta${i}`] : req.body[`aposta`];
            const oddMin = i > 1 ? req.body[`oddmin${i}`] : req.body[`oddmin`];
            const oddMax = i > 1 ? req.body[`oddmax${i}`] : req.body[`oddmax`];
            const pais = i > 1 ? req.body[`pais${i}`] : req.body[`pais`];
            const liga = i > 1 ? req.body[`liga${i}`] : req.body[`liga`];
            const times = i > 1 ? req.body[`times${i}`] : req.body[`times`];
            const filtroTime = i > 1 ? req.body[`filtroTime${i}`] : req.body[`filtroTime`];
            const aposta2 = i > 1 ? req.body[`combase${i}`] : req.body[`combase`];
            const oddMin2 = i > 1 ? req.body[`coddmin${i}`] : req.body[`coddmin`];
            const oddMax2 = i > 1 ? req.body[`coddmax${i}`] : req.body[`coddmax`];

            if (aposta) {
                regras.push({
                    aposta,
                    oddMin,
                    oddMax,
                    pais,
                    liga,
                    times,
                    filtroTime,
                    aposta2,
                    oddMin2,
                    oddMax2
                });
            }
        }

        const novaRegras = [];

        for (const regra of regras) {
            const timesIds = [];
            const paisesIds = [];
            const ligasIds = [];

            // Verifica se `aposta` está presente
            if (!regra.aposta) {
                res.status(400).json({
                    "status": "error",
                    "message": "Formulário inválido",
                    "errorCode": 400,
                    "details": [{
                        path: ['Aposta'],
                        message: ['O campo *apostar em* é obrigatório em cada regra!'],
                    }]
                });
                return false;
            }

            // Validação de `Filtro de Time`
            if (regra.filtroTime != "" && regra.filtroTime != "Todos") {
                const filtroTime = await filtro.pegaUmRegistro({
                    where: { id: regra.filtroTime }
                });

                if (!filtroTime) {
                    res.status(400).json({
                        "status": "error",
                        "message": "Formulário inválido",
                        "errorCode": 400,
                        "details": [{
                            path: ['Aposta'],
                            message: ['O *filtro de jogos* está com informação invalida!'],
                        }]
                    });
                    return false;
                }
            }

            // Validação de `Time`
            if (regra.times && regra.times.length > 0) {
                const ids = [];
                regra.times.map((item) => {
                    ids.push(item.value);
                });

                const timesValidos = await timeServices.pegaTodosOsRegistros({
                    where: { id: { [Op.in]: ids } }
                });

                if (timesValidos.length !== regra.times.length) {
                    res.status(400).json({
                        "status": "error",
                        "message": "Formulário inválido",
                        "errorCode": 400,
                        "details": [{
                            path: ['Times'],
                            message: ['Algum time não contem em nossos sistema!'],
                        }]
                    });
                    return false;
                }

                timesIds.push(...ids); // Adiciona os valores ao array global
            }

            // Validação de `aposta`
            const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                where: { id: regra.aposta }
            });

            if (!regravalidacoeExists) {
                res.status(400).json({
                    "status": "error",
                    "message": "Formulário inválido",
                    "errorCode": 400,
                    "details": [{
                        path: ['Aposta'],
                        message: ['O campo aposta é obrigatório em cada regra!'],
                    }]
                });
                return false;
            }

            // Validação de `pais`
            if (regra.pais && regra.pais.length > 0) {
                const ids = [];
                regra.pais.map((item) => {
                    ids.push(item.value);
                });
                const paisesValidos = await paiServices.pegaTodosOsRegistros({
                    where: { id: { [Op.in]: ids } }
                });

                if (paisesValidos.length !== regra.pais.length) {
                    res.status(400).json({
                        "status": "error",
                        "message": "Formulário inválido",
                        "errorCode": 400,
                        "details": [{
                            path: ['Paises'],
                            message: ['Algum pais não contem em nossos sistema!'],
                        }]
                    });
                    return false;
                }

                paisesIds.push(...ids); // Adiciona os valores ao array global
            }


            // Validação de `liga`
            if (regra.liga && regra.liga.length > 0) {
                const ids = [];
                regra.liga.map((item) => {
                    ids.push(item.value);
                });
                const ligasValidas = await ligaServices.pegaTodosOsRegistros({
                    where: { id: { [Op.in]: ids } }
                });

                if (ligasValidas.length !== regra.liga.length) {
                    res.status(400).json({
                        "status": "error",
                        "message": "Formulário inválido",
                        "errorCode": 400,
                        "details": [{
                            path: ['Ligas'],
                            message: ['Alguma liga selecioanda não contem em nossos sistema!'],
                        }]
                    });
                    return false;
                }

                ligasIds.push(...ids);
            }

            // Adiciona os dados validados à nova regra
            novaRegras.push({
                ...regra,
                validPaisesIds: paisesIds,
                validLigasIds: ligasIds,
                validTimesIds: timesIds
            });

        }

        const regrasCriar = novaRegras.map(regra => ({
            oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
            oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null,
            pai_id: regra.validPaisesIds.length > 0 ? regra.validPaisesIds.join(',') : null,
            liga_id: regra.validLigasIds.length > 0 ? regra.validLigasIds.join(',') : null,
            time_id: regra.validTimesIds.length > 0 ? regra.validTimesIds.join(',') : null,
            regravalidacoe_id: regra.aposta,
            regravalidacoe2_id: regra.aposta2 ? regra.aposta2 : null,
            oddmin2: regra.oddMin2 ? parseFloat(regra.oddMin2) : null,
            oddmax2: regra.oddMax2 ? parseFloat(regra.oddMax2) : null,
            //regravalidacoe3_id: req.body.aposta3 ? req.body.aposta3 : null,
            //oddmin3: req.body.oddMin3 ? parseFloat(req.body.oddMin3) : null,
            //oddmax3: req.body.oddMax3 ? parseFloat(req.body.oddMax3) : null,
            filtrojogo_id: req.body.filtroTime && req.body.filtroTime != "Todos" ? req.body.filtroTime : null,
            fjcasa_id: req.body.fjcasa && req.body.fjcasa != "Todos" ? req.body.fjcasa : null,
            fjfora_id: req.body.fjfora && req.body.fjfora != "Todos" ? req.body.fjfora : null,
        }));

        return ({ estrategia, descricao, regras: regrasCriar });
    }

    async estrategiaTeste(req, res) {
        try {

            let parsedBody;
            try {
                parsedBody = formSchema.parse(req.body);
            } catch (error) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Formulário inválido",
                    "errorCode": 400,
                    "details": error.errors
                });
            }

            var estrategiaValida = await this.#validaEstrategia({ body: parsedBody }, res);
            if (estrategiaValida === false) return;

            try {
                const { jogos, bilhetes } = await bilheteServices.montaBilhetes(estrategiaValida, false, false);

                estrategiaValida.bilhetes = bilhetes;
                estrategiaValida.jogos = jogos;
            } catch (error) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Formulário inválido",
                    "errorCode": 400,
                    "details": [{
                        path: ['Erro ao Buscar Jogos'],
                        message: [error.message],
                    }]
                });
            }
            estrategiaValida = await estrategiaServices.geraEstistica(estrategiaValida, false);

            estrategiaValida.grafico = bilhetesToGrafico(estrategiaValida.bilhetes);
            delete estrategiaValida.bilhetes;
            delete estrategiaValida.jogos;

            return res.status(200).json({
                "status": "success",
                "message": "Teste realizado com sucesso!",
                "statusCode": 200,
                "pagination": {},
                data: estrategiaValida
            });
        } catch (error) {
            console.log('error', error)
            return res.status(500).json({
                "status": "error",
                "message": "Erro ao testar estratégia",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async getEstrategiaGrafico(req, res) {
        const { id } = req.params;
        try {
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(Number(id));

            if (!estrategia) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": "Nenhuma estrategia foi encontrada!"
                });
            }

            //Retorna o gráfico se ele foi gerado no dia
            if (estrategia.updatedAt.toISOString().split('T')[0] == toDay() && estrategia.grafico_json != null) {
                return res.status(200).json({
                    "status": "success",
                    "message": "Gráfico da Estratégia retornado com sucesso",
                    "statusCode": 200,
                    "pagination": {},
                    data: estrategia.grafico_json
                });
            }

            const bilhetes = await estrategia.getBilhetes();

            if (!bilhetes) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Nenhum bilhete encontrado para essa estratégia",
                    "errorCode": 404,
                    "details": `Nenhum bilhete foi encontrado para a estratégia com id: ${id}. Verifique se a estratégia possui bilhetes associados ou se houve algum erro no processamento dos bilhetes.`
                });
            }

            const dadosGrafico = bilhetesToGrafico(bilhetes);

            await estrategiaServices.atualizaRegistro({ grafico_json: dadosGrafico }, { id: Number(id) });

            return res.status(200).json({
                "status": "success",
                "message": "Gráfico da Estratégia retornado com sucesso",
                "statusCode": 200,
                "pagination": {},
                data: dadosGrafico
            });
        } catch (erro) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar gráfrico estrategias",
                "errorCode": 500,
                "details": erro.message
            });
        }
    }

    async getEstrategias(req, res) {
        const { page = 1, pageSize = 10 } = req.query;

        try {
            const { count, rows: estrategias } = await estrategiaServices.getEstrategias(Number(page), Number(pageSize));

            if (!estrategias) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategias não encontradas",
                    "errorCode": 404,
                    "details": "Nenhuma estrategia foi encontrada!"
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "Estrategias encontradas",
                "statusCode": 200,
                "pagination": {
                    "Page": parseInt(page, 10),
                    "totalPages": Math.ceil(count / pageSize),
                    "totalItems": parseInt(count, 10)
                },
                data: estrategias
            });
        } catch (erro) {
            return res.status(500).json(
                {
                    "status": "error",
                    "message": "Erro interno ao buscar estrategias",
                    "errorCode": 500,
                    "details": erro.message
                });
        }
    }

    async getEstrategia(req, res) {
        const { id } = req.params;
        const { page = 1, pageSize = 10 } = req.query;

        try {
            const umRegistro = await estrategiaServices.getEstrategia(Number(id), Number(page), Number(pageSize));

            if (!umRegistro) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": `Nenhuma estrategia foi encontrada com esse id: ${id}!`
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "Estrategias encontradas",
                "statusCode": 200,
                "pagination": {},
                data: umRegistro
            });
        } catch (erro) {
            return res.status(500).json(
                {
                    "status": "error",
                    "message": "Erro interno ao buscar estrategia",
                    "errorCode": 500,
                    "details": erro.message
                });
        }
    }

    async getBilhetes(req, res) {
        const { id } = req.params;
        const { page = 1, pageSize = 20 } = req.query;

        try {

            const estrategia = await estrategiaServices.getEstrategia(Number(id));

            if (!estrategia) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": "Nenhuma estrategia foi encontrada!"
                });
            }

            if (estrategia.grafico_json == null) {
                const ee = await estrategiaServices.pegaUmRegistroPorId(id);
                ee.grafico_json = bilhetesToGrafico(await ee.getBilhetes());
                await ee.save();
            }

            const { count, bilhetes } = await bilheteServices.getBilhetes({
                limit: pageSize,
                offset: (page - 1) * pageSize,
                where: { id }
            });

            if (!bilhetes || bilhetes.length === 0) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Nenhum bilhete encontrado para essa estratégia",
                    "errorCode": 404,
                    "details": `Nenhum bilhete foi encontrado para a estratégia com id: ${id}. Verifique se a estratégia possui bilhetes associados ou se houve algum erro no processamento dos bilhetes.`
                });

            }

            const ret = { ...bilhetes.dataValues };
            ret.regras = estrategia.Regras;

            return res.status(200).json({
                "status": "success",
                "message": "Estrategias encontradas",
                "statusCode": 200,
                "pagination": {
                    "page": parseInt(page, 10),
                    "totalPages": Math.ceil(count / pageSize),
                    "totalItems": bilhetes.length,
                    "totalRegistro": count
                },
                data: ret
            });
        } catch (erro) {
            console.error(erro)
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar bilehtes da estrategia",
                "errorCode": 500,
                "details": erro.message
            });
        }
    }

    async getTopEstrategia(req, res) {
        try {
            const estrategia = await estrategiaServices.getTopEstrategia();

            if (estrategia.grafico_json == null) {
                estrategia.grafico_json = bilhetesToGrafico(await estrategia.getBilhetes());
                await estrategia.save();
            }

            if (!estrategia) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": "Nenhuma estratégia foi encontrada no sistema. Verifique se há estratégias cadastradas ou se houve algum erro no processamento."
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "Estrategia encontrada",
                "statusCode": 200,
                "pagination": {},
                data: estrategia
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar estrategia",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async criarEstrategia(req, res) {
        try {
            const estrategiaValida = await this.#validaEstrategia(req, res);

            // Cria a estratégia
            const novaEstrategia = await estrategiaServices.criaRegistro({
                nome: estrategiaValida.estrategia,
                descricao: estrategiaValida.descricao
            });

            if (!novaEstrategia || !novaEstrategia.id) {
                return res.status(500).json({
                    "status": "error",
                    "message": "Erro interno ao criar estrategia",
                    "errorCode": 500,
                    "details": erro.message
                });
            }

            // Cria as regras associadas à estratégia
            const regrasAtualizadas = estrategiaValida.regras.map(regra => ({
                ...regra,
                estrategia_id: novaEstrategia.id
            }));

            await regraServices.criaVariosRegistros(regrasAtualizadas);

            await bilheteServices.montaBilhetes(novaEstrategia);

            // Calcula as estatiscica da estrategia
            const estrategiaComRegras = await estrategiaServices.geraEstistica(novaEstrategia);

            return res.status(201).json({
                "status": "success",
                "message": "Estratégia criada com sucesso!'",
                "statusCode": 201,
                "pagination": {},
                data: estrategiaComRegras
            });
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao criar estrategia",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async updateEstrategia(req, res) {
        const { id } = req.params;
        try {
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(Number(id));

            const { nome, descricao } = req.body;

            if (!nome || !descricao) {
                res.status(400).json({
                    "status": "error",
                    "message": "Nome e descrição são obrigatórios!",
                    "errorCode": 400,
                    "details": "Nome e descrição são obrigatórios!"
                });
            }

            if (!estrategia) {
                res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": `Nenhuma estrategia foi encontrada com esse id: ${id}!`
                });
            }

            estrategia.nome = nome;
            estrategia.descricao = descricao;
            estrategia.grafico_json = null;

            await estrategia.save();

            res.status(200).json({
                "status": "success",
                "message": "Estrategia atualizada com sucesso",
                "statusCode": 200,
                "pagination": {},
                data: estrategia
            });

        } catch (error) {
            res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar estrategia",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async deleteEstrategia(req, res) {
        const { id } = req.params;
        try {
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(Number(id));
            const bilhetes = await estrategia.getBilhetes();
            const regras = await estrategia.getRegras();

            if (bilhetes) {
                for (const bilhete of bilhetes) {
                    await bilhete.destroy();
                }
            }
            if (regras) {
                for (const regra of regras) {
                    await regra.destroy();
                }
            }

            if (!estrategia) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Estrategia não encontrada",
                    "errorCode": 404,
                    "details": `Nenhuma estrategia foi encontrada com esse id: ${id}!`
                });
            }

            await estrategia.destroy();

            return res.status(200).json({
                "status": "success",
                "message": "Estrategia deletada com sucesso",
                "statusCode": 200,
                "pagination": {},
                data: null
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao deletar estrategia",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async dataForms(req, res) {
        try {
            const regras = [];
            const { count, rows } = await regravalidacoeServices.getRegrasValidacao();

            for (const regra of rows) {
                regras.push({
                    value: regra.id.toString(),
                    label: `${regra.Tipoapostum.nome ? regra.Tipoapostum.nome : regra.Tipoapostum.name} - ${regra.nome}`
                });
            }
            const regras2 = [
                { value: "9999991", label: 'Time(s) Selecionado(s) Ganhar' },
                { value: "9999992", label: 'Time(s) Selecionado(s) Empatar' },
                { value: "9999993", label: 'Time(s) Selecionado(s) Perder' },
                { value: "9999994", label: 'Time(s) Selecionado(s) Ganhar ou Empatar' },
                { value: "9999995", label: 'Time(s) Selecionado(s) Perder ou Empatar' },
            ];
            const paises = [];
            for (const pai of await paiServices.pegaTodosOsRegistros()) {
                paises.push({
                    value: pai.id.toString(),
                    label: pai.nome
                });
            }
            const ligas = [];
            for (const liga of await ligaServices.pegaTodosOsRegistros()) {
                ligas.push({
                    value: liga.id.toString(),
                    label: liga.nome
                });
            }
            const times = [];
            for (const time of await timeServices.pegaPrincipaisTimes()) {
                times.push({
                    value: time.id.toString(),
                    label: time.nome
                });
            }
            const Filtrojogogeral = await filtro.getFiltrosJogos({ geral: true });
            const Filtrojogocasa = await filtro.getFiltrosJogos({ casa: true });
            const Filtrojogofora = await filtro.getFiltrosJogos({ fora: true });

            return res.status(200).json({
                "status": "success",
                "message": "Dados retornados com sucesso!",
                "statusCode": 200,
                "pagination": {},
                data: {
                    regras,
                    times,
                    paises,
                    ligas,
                    Filtrojogogeral,
                    Filtrojogocasa,
                    Filtrojogofora,
                    regras2
                }
            });

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar dados",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    /*
    async atualizarEstrategia(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, regras } = req.body;

            // Verificação de campos obrigatórios
            if (!nome || !descricao) {
                return res.status(400).json({ error: 'Nome e descrição são obrigatórios!' });
            }
            if (!regras || regras.length < 1) {
                return res.status(400).json({ error: 'Pelo menos uma regra é necessária!' });
            }

            // Verifica se a estratégia existe
            const estrategiaExistente = await estrategiaServices.pegaUmRegistroPorId(id);
            if (!estrategiaExistente) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            // Validação dos IDs de regravalidacoe
            for (const regra of regras) {
                if (!regra.aposta) {
                    return res.status(400).json({ error: 'O campo aposta é obrigatório em cada regra!' });
                }

                if (regra.pais) {
                    const paiExists = await paiServices.pegaUmRegistro({
                        where: { id: regra.pais }
                    });
                    if (!paiExists) {
                        return res.status(400).json({ error: `O pais não existe em nossa base de dados.` });
                    }
                }
                if (regra.liga) {
                    const ligaExists = await ligaServices.pegaUmRegistro({
                        where: { id: regra.liga }
                    });
                    if (!ligaExists) {
                        return res.status(400).json({ error: `A liga não existe em nossa base de dados.` });
                    }
                }
                if (regra.time) {
                    const timeExists = await timeServices.pegaUmRegistro({
                        where: { id: regra.time }
                    });
                    if (!timeExists) {
                        return res.status(400).json({ error: `O time não existe em nossa base de dados.` });
                    }
                }
                // Verifica se o regravalidacoe_id existe na tabela `Regravalidacoe`
                const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                    where: { id: regra.aposta }
                });
                if (!regravalidacoeExists) {
                    return res.status(400).json({ error: `O ID de aposta ${regra.aposta} não existe na tabela regravalidacoe.` });
                }
            }

            // Atualiza a estratégia
            await estrategiaServices.atualizaRegistro({ nome, descricao }, { id });

            // Atualiza ou cria regras associadas à estratégia
            const regrasFormatadas = regras.map(regra => ({
                estrategia_id: id,
                pai_id: regra.pais == 0 ? null : regra.pais || null,
                liga_id: regra.liga == 0 ? null : regra.liga || null,
                time_id: regra.time == 0 ? null : regra.time || null,
                regravalidacoe_id: regra.aposta,
                oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
                oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null
            }));


            // Apaga as regras existentes e recria com os novos dados
            await regraServices.excluiVarios({ estrategia_id: id });
            await regraServices.criaVariosRegistros(regrasFormatadas);
            //await estrategiaServices
            const bilhetes = await estrategiaExistente.getBilhetes();

            for (const bilhete of bilhetes) {
                await bilhete.destroy();
            }
            // Executa a estratégia para recalcular apostas
            const apostas = await bilheteServices.montaBilhetes(estrategiaExistente);

            // Retorna a estratégia atualizada com as regras incluídas
            const estrategiaComRegras = await estrategiaServices.geraEstistica(estrategiaExistente);

            return res.status(200).json({ message: 'Estratégia atualizada com sucesso!', estrategia: estrategiaComRegras });
        } catch (error) {
            console.error('Erro ao atualizar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao atualizar estratégia: ' + error.message });
        }
    }
    */

}

module.exports = EstrategiaController;
