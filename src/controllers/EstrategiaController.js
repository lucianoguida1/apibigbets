const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const PaiServices = require('../services/PaiServices.js');
const LigaServices = require('../services/LigaServices.js');
const RegraServices = require('../services/RegraServices.js');
const { Op } = require('sequelize');
const bilhetesToGrafico = require('../utils/bilhetesToGrafico.js');
const toDay = require('../utils/toDay.js');

const estrategiaServices = new EstrategiaServices();
const bilheteServices = new BilheteServices();
const regravalidacoeServices = new RegravalidacoeServices();
const paiServices = new PaiServices();
const ligaServices = new LigaServices();
const regraServices = new RegraServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async #validaEstrategia(req, res) {
        const { nome, descricao, regras } = req.body;

        // Verificação de campos obrigatórios
        if (!nome) {
            throw new Error('Nome e descrição são obrigatórios!');
        }
        if (!regras || regras.length < 1) {
            throw new Error('Pelo menos uma regra é necessária!');
        }

        const novaRegras = [];

        for (const regra of regras) {
            const paisesIds = [];
            const ligasIds = [];

            // Verifica se `aposta` está presente
            if (!regra.aposta) {
                throw new Error('O campo aposta é obrigatório em cada regra!');
            }

            // Validação de `aposta`
            const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                where: { id: regra.aposta }
            });

            if (!regravalidacoeExists) {
                throw new Error(`Aposta não existe.`);
            }

            // Validação de `pais`
            if (regra.pais && regra.pais.length > 0) {
                const ids = regra.pais.split(',').map(Number); // Sem `const` aqui
                const paisesValidos = await paiServices.pegaTodosOsRegistros({
                    where: { id: { [Op.in]: ids } }
                });

                if (paisesValidos.length !== ids.length) {
                    throw new Error("Algum pais não contem em nossos sistema!");
                }

                paisesIds.push(...ids); // Adiciona os valores ao array global
            }

            // Validação de `liga`
            if (regra.liga && regra.liga.length > 0) {
                const ids = regra.liga.split(',').map(Number); // Sem `const` aqui
                const ligasValidas = await ligaServices.pegaTodosOsRegistros({
                    where: { id: { [Op.in]: ids } }
                });

                if (ligasValidas.length !== ids.length) {
                    throw new Error("Alguma liga não contem em nossos sistema!");
                }

                ligasIds.push(...ids); // Adiciona os valores ao array global
            }

            // Adiciona os dados validados à nova regra
            novaRegras.push({
                ...regra,
                validPaisesIds: paisesIds,
                validLigasIds: ligasIds,
            });
        }

        const regrasCriar = novaRegras.map(regra => ({
            oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
            oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null,
            pai_id: regra.validPaisesIds.length > 0 ? regra.validPaisesIds.join(',') : null,
            liga_id: regra.validLigasIds.length > 0 ? regra.validLigasIds.join(',') : null,
            regravalidacoe_id: regra.aposta,
            regravalidacoe2_id: regra.aposta2 ? regra.aposta2 : null,
            oddmin2: regra.oddMin2 ? parseFloat(regra.oddMin2) : null,
            oddmax2: regra.oddMax2 ? parseFloat(regra.oddMax2) : null,
            regravalidacoe3_id: regra.aposta3 ? regra.aposta3 : null,
            oddmin3: regra.oddMin3 ? parseFloat(regra.oddMin3) : null,
            oddmax3: regra.oddMax3 ? parseFloat(regra.oddMax3) : null,
        }));


        return ({ nome, descricao, regras: regrasCriar });
    }

    async estrategiaTeste(req, res) {
        try {

            var estrategiaValida = await this.#validaEstrategia(req, res);

            const { jogos, bilhetes } = await bilheteServices.montaBilhetes(estrategiaValida, false, false);
            estrategiaValida.bilhetes = bilhetes;
            estrategiaValida.jogos = jogos;

            estrategiaValida = await estrategiaServices.geraEstistica(estrategiaValida, false);

            estrategiaValida.grafico = bilhetesToGrafico(bilhetes);
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
            const estrategias = await estrategiaServices.getEstrategias(Number(page), Number(pageSize));

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
                    "totalPages": Math.ceil(estrategias.count / pageSize),
                    "totalItems": parseInt(pageSize, 10)
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
        const { page = 1, pageSize = 100 } = req.query;

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

            const { count, bilhetes } = await bilheteServices.getBilhetes({
                limit: pageSize,
                offset: (page - 1) * pageSize,
                where: { estrategia_id: id },
                order: [['data', 'DESC']],
            });

            if (!bilhetes || bilhetes.length === 0) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Nenhum bilhete encontrado para essa estratégia",
                    "errorCode": 404,
                    "details": `Nenhum bilhete foi encontrado para a estratégia com id: ${id}. Verifique se a estratégia possui bilhetes associados ou se houve algum erro no processamento dos bilhetes.`
                });
            }

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
                data: bilhetes
            });
        } catch (erro) {
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
                nome: estrategiaValida.nome,
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
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao criar estrategia",
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
