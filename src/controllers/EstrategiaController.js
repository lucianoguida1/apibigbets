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

    async getEstrategiaGrafico(req, res) {
        const { id } = req.params;
        try {
            const umRegistro = await estrategiaServices.getBilhetes(Number(id));
    
            let dadosGrafico = {
                nome: umRegistro.nome,
                descricao: umRegistro.descricao,
                dados: []
            };
    
            if (!umRegistro.Bilhetes || umRegistro.Bilhetes.length === 0) {
                // Retornar uma resposta vazia se não houver bilhetes
                return res.status(200).json(dadosGrafico);
            }
    
            const lucroPorData = {}; // Objeto para armazenar o lucro acumulado por data
            const bilhetesPorData = {}; // Objeto para armazenar a quantidade de bilhetes por data
            const ganhosPorData = {}; // Objeto para armazenar quantidade de bilhetes ganhados por data
            const perdasPorData = {}; // Objeto para armazenar quantidade de bilhetes perdidos por data
    
            // Agrupar por bilhete_id
            const bilhetesAgrupados = umRegistro.Bilhetes.reduce((acc, bilhete) => {
                if (!acc[bilhete.bilhete_id]) acc[bilhete.bilhete_id] = [];
                acc[bilhete.bilhete_id].push(bilhete);
                return acc;
            }, {});
    
            // Processar cada grupo de bilhete_id
            for (const [bilheteId, bilhetes] of Object.entries(bilhetesAgrupados)) {
                // Encontrar a maior data entre os jogos do bilhete
                const dataMaisRecente = bilhetes.reduce((max, bilhete) => {
                    const dataJogo = new Date(bilhete.Jogo.datahora);
                    return dataJogo > max ? dataJogo : max;
                }, new Date(0));
    
                // Calcular o lucro do bilhete
                const statusBilhete = bilhetes[0].status_bilhete; // Considera o mesmo status para o grupo
                const odd = bilhetes[0].odd; // Considera a mesma odd para o grupo
                const lucro = statusBilhete ? (odd - 1) : -1;
    
                // Converter data para string e acumular o lucro e contagem no objeto lucroPorData
                const dataStr = dataMaisRecente.toISOString().split('T')[0];
    
                if (!lucroPorData[dataStr]) {
                    lucroPorData[dataStr] = 0;
                    bilhetesPorData[dataStr] = 0;
                    ganhosPorData[dataStr] = 0;
                    perdasPorData[dataStr] = 0;
                }
    
                // Atualizar dados de lucro, quantidade total de bilhetes, ganhos e perdas
                lucroPorData[dataStr] += lucro;
                bilhetesPorData[dataStr] += 1;
                if (statusBilhete) {
                    ganhosPorData[dataStr] += 1;
                } else {
                    perdasPorData[dataStr] += 1;
                }
            }
    
            // Iniciar o saldo com 1 real
            let saldo = 1;
    
            // Transformar o objeto lucroPorData em um array ordenado e calcular saldo acumulado para o gráfico
            dadosGrafico.dados = Object.entries(lucroPorData)
                .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Ordenar por data
                .map(([data, lucro]) => {
                    saldo = parseFloat((saldo + lucro).toFixed(2)); // Atualizar saldo acumulado e arredondar para evitar problemas de precisão
                    return {
                        data,
                        lucro: parseFloat(lucro.toFixed(2)),
                        saldo,
                        quantidadeBilhetes: bilhetesPorData[data],
                        bilhetesGanhados: ganhosPorData[data],
                        bilhetesPerdidos: perdasPorData[data]
                    };
                });
    
            return res.status(200).json(dadosGrafico);
        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
    }
    
    



    async getEstrategia(req, res) {
        const { id } = req.params;
        try {
            const umRegistro = await estrategiaServices.getEstrategia(Number(id));
            return res.status(200).json(umRegistro);
        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
    }


    async getBilhetes(req, res) {
        const { id } = req.params;
        try {
            const umRegistro = await estrategiaServices.getBilhetes(Number(id));
            return res.status(200).json(umRegistro);
        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
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
            //await estrategiaServices
            const bilhetes = await estrategiaExistente.getBilhetes();

            for (const bilhete of bilhetes) {
                await bilhete.destroy();
            }
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
