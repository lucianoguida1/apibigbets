const { Op, Sequelize } = require('sequelize');
const { Regra } = require('../database/models')
const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const JogoServices = require('../services/JogoServices.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const PaiServices = require('../services/PaiServices.js');
const LigaServices = require('../services/LigaServices.js');
const TimeServices = require('../services/TimeServices.js');
const RegraServices = require('../services/RegraServices.js');
const { startOfWeek } = require('date-fns'); // Para cálculo de semanas

const estrategiaServices = new EstrategiaServices();
const bilheteServices = new BilheteServices();
const jogoServices = new JogoServices();
const regravalidacoeServices = new RegravalidacoeServices();
const paiServices = new PaiServices();
const timeServices = new TimeServices();
const ligaServices = new LigaServices();
const regraServices = new RegraServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async getTopEstrategia(req, res) {
        try {
            const estrategia = await estrategiaServices.getTopEstrategia();

            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            return res.status(200).json(estrategia);
        } catch (error) {
            console.error('Erro ao buscar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao buscar estratégia: ' + error.message });
        }
    }

    async criarEstrategia(req, res) {
        try {
            const { nome, descricao, regras } = req.body;

            // Verificação de campos obrigatórios
            if (!nome || !descricao) {
                return res.status(400).json({ error: 'Nome e descrição são obrigatórios!' });
            }
            if (!regras || regras.length < 1) {
                return res.status(400).json({ error: 'Pelo menos uma regra é necessária!' });
            }

            // Validação dos IDs de regravalidacoe
            for (const regra of regras) {
                if (!regra.aposta) {
                    return res.status(400).json({ error: 'O campo aposta é obrigatório em cada regra!' });
                }

                // Verifica se o regravalidacoe_id existe na tabela `Regravalidacoe`
                const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                    where: { id: regra.aposta }
                });

                if (!regravalidacoeExists) {
                    return res.status(400).json({ error: `O ID de aposta ${regra.aposta} não existe na tabela regravalidacoe.` });
                }
            }

            // Cria a estratégia
            const novaEstrategia = await estrategiaServices.criaRegistro({ nome, descricao });

            // Converte campos vazios das regras para null e prepara as regras para criação
            const regrasFormatadas = regras.map(regra => ({
                estrategia_id: novaEstrategia.id,
                pai_id: regra.pais || null,
                liga_id: regra.liga || null,
                time_id: regra.time || null,
                regravalidacoe_id: regra.aposta, // Usa o ID de aposta para regravalidacoe_id
                oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
                oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null
            }));

            // Cria as regras associadas à estratégia
            await regraServices.criaVariosRegistros(regrasFormatadas);


            const apostas = await estrategiaServices.executarEstrategia(novaEstrategia.id);

            // Retorna a estratégia recém-criada com as regras incluídas
            const estrategiaComRegras = await estrategiaServices.pegaUmRegistro({
                where: { id: novaEstrategia.id },
                include: [{ model: Regra }] // Inclui as regras associadas
            });


            return res.status(201).json({ message: 'Estratégia criada com sucesso!', estrategia: estrategiaComRegras, apostas });
        } catch (error) {
            console.error('Erro ao criar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao criar estratégia: ' + error.message });
        }
    }

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
                pai_id: regra.pais || null,
                liga_id: regra.liga || null,
                time_id: regra.time || null,
                regravalidacoe_id: regra.aposta,
                oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
                oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null
            }));


            // Apaga as regras existentes e recria com os novos dados
            await regraServices.excluiVarios({ estrategia_id: id });
            await regraServices.criaVariosRegistros(regrasFormatadas);

            // Executa a estratégia para recalcular apostas
            const apostas = await estrategiaServices.executarEstrategia(id);

            // Retorna a estratégia atualizada com as regras incluídas
            const estrategiaComRegras = await estrategiaServices.pegaUmRegistro({
                where: { id },
                include: [{ model: Regra }] // Inclui as regras associadas
            });

            return res.status(200).json({ message: 'Estratégia atualizada com sucesso!', estrategia: estrategiaComRegras, apostas });
        } catch (error) {
            console.error('Erro ao atualizar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao atualizar estratégia: ' + error.message });
        }
    }


    async executarEstrategia(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID da estratégia não fornecido!' });
            }

            const apostas = await estrategiaServices.executarEstrategia(req.params.id);
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
