const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const JogoServices = require('../services/JogoServices.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const PaiServices = require('../services/PaiServices.js');
const LigaServices = require('../services/LigaServices.js');
const TimeServices = require('../services/TimeServices.js');
const RegraServices = require('../services/RegraServices.js');
const toDay = require('../utils/toDay.js');

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

    async estrategiaTeste(req, res) {
        try {
            const { nome, descricao, regras } = req.body;

            // Verificação de campos obrigatórios
            if (!nome || !descricao) {
                return res.status(400).json({ error: 'Nome e descrição são obrigatórios!' });
            }
            if (!regras || regras.length < 1) {
                return res.status(400).json({ error: 'Pelo menos uma regra é necessária!' });
            }

            const novaRegras = [];

            for (const regra of regras) {
                const paisesIds = [];
                const ligasIds = [];

                // Verifica se `aposta` está presente
                if (!regra.aposta) {
                    return res.status(400).json({ error: 'O campo aposta é obrigatório em cada regra!' });
                }

                // Validação de `aposta`
                const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                    where: { id: regra.aposta }
                });

                if (!regravalidacoeExists) {
                    return res.status(400).json({ error: `O ID de aposta ${regra.aposta} não existe na tabela regravalidacoe.` });
                }

                // Validação de `pais`
                if (regra.pais && regra.pais.length > 0) {
                    const idsPais = regra.pais.map((p) => p.value);

                    const paisesValidos = await paiServices.pegaTodosOsRegistros({
                        where: { id: idsPais }
                    });

                    const paisesEncontrados = paisesValidos.map((p) => p.id);
                    const paisesNaoEncontrados = idsPais.filter((id) => !paisesEncontrados.includes(id));

                    if (paisesNaoEncontrados.length > 0) {
                        return res.status(400).json({
                            error: `Os IDs de país ${paisesNaoEncontrados.join(', ')} não existem no sistema.`
                        });
                    }

                    paisesIds.push(...paisesEncontrados);
                }

                // Validação de `liga`
                if (regra.liga && regra.liga.length > 0) {
                    const idsLiga = regra.liga.map((l) => l.value);

                    const ligasValidas = await ligaServices.pegaTodosOsRegistros({
                        where: { id: idsLiga }
                    });

                    const ligasEncontradas = ligasValidas.map((l) => l.id);
                    const ligasNaoEncontradas = idsLiga.filter((id) => !ligasEncontradas.includes(id));

                    if (ligasNaoEncontradas.length > 0) {
                        return res.status(400).json({
                            error: `Os IDs de liga ${ligasNaoEncontradas.join(', ')} não existem no sistema.`
                        });
                    }

                    ligasIds.push(...ligasEncontradas);
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
            }));

            let estrategia = {};

            try {
                const jogosUnicos = await jogoServices.filtrarJogosUnicos(regrasCriar);
                if (jogosUnicos.length === 0) {
                    throw new Error('Nenhum jogo encontrado!');
                }
                if (jogosUnicos.length <= regras.length) {
                    throw new Error('Quantidade de jogos insuficiente!');
                }

                let apostas = {};
                const bilhetesCriar = [];
                let i = 1;

                const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

                for (const jogo of jogosArray) {
                    if (!apostas[i]) {
                        apostas[i] = { odd: 1, status: true, jogos: [] };
                    }
                    bilhetesCriar.push({
                        bilhete_id: i,
                        jogo_id: jogo.id,
                        odd_id: jogo.odd_id,
                        status_jogo: jogo.statusOdd
                    });

                    apostas[i].jogos.push(jogo);
                    apostas[i].odd *= jogo.odd;

                    if (apostas[i].jogos.length >= regras.length || jogo === jogosArray.at(-1)) {
                        const algumStatusNulo = apostas[i].jogos.some((j) => j.statusOdd === null);
                        apostas[i].status = algumStatusNulo ? null : apostas[i].jogos.every((j) => j.statusOdd === true);
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


                // Agrupar e filtrar informações únicas
                const filteredBilhetes = bilhetesCriar.reduce((acc, bilhete) => {
                    // Verifica se já existe um registro para este bilhete_id com os mesmos valores
                    const exists = acc.some(item =>
                        item.bilhete_id === bilhete.bilhete_id &&
                        item.status_bilhete === bilhete.status_bilhete &&
                        item.odd === bilhete.odd &&
                        item.data === bilhete.data
                    );

                    // Se não existir, adiciona ao acumulador
                    if (!exists && bilhete.status_bilhete != null) {
                        acc.push({
                            bilhete_id: bilhete.bilhete_id,
                            status_bilhete: bilhete.status_bilhete,
                            odd: bilhete.odd,
                            data: bilhete.data
                        });
                    }

                    return acc;
                }, []);

                console.log(filteredBilhetes)

                estrategia.total_apostas = filteredBilhetes.length;
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
                estrategia.sequencia_vitorias = 0;
                estrategia.sequencia_derrotas = 0;

                let sequenciaAtualVitoria = 0;
                let sequenciaAtualDerrota = 0;
                let somaOddVitoriosa = 0;
                let somaOddDerrotada = 0;
                let countVitoriosa = 0;
                let countDerrotada = 0;
                let dias = {};
                let semanas = {};
                let sequenciasVitoria = []; // Armazena todas as sequências de vitórias para calcular a média posteriormente


                filteredBilhetes.forEach(bilhete => {
                    const { odd, status_bilhete, data } = bilhete;

                    estrategia.odd_total += Number(odd);
                    estrategia.odd_minima = Math.min(estrategia.odd_minima, odd);
                    estrategia.odd_maxima = Math.max(estrategia.odd_maxima, odd);

                    const isVitoria = status_bilhete; // Supondo que `true` é vitória e `false` é derrota

                    const data2 = new Date(data);
                    const dia = data2.toISOString().split('T')[0];
                    const semana = `${data2.getUTCFullYear()}-W${Math.ceil((data2.getUTCDate() - data2.getUTCDay() + 7) / 7)}`;

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

                        estrategia.lucro_total += (Number(odd) - 1); // ajustado conforme o cálculo de lucro desejado
                        somaOddVitoriosa += Number(odd);
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
                        somaOddDerrotada += Number(odd);
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

                estrategia.lucro_total = estrategia.lucro_total.toFixed(2);

            } catch (error) {
                console.error('BilhetesServicesTeste:', error.message);
            }

            return res.status(201).json({ message: 'Teste realizado com sucesso!', estrategia });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao testar estratégia: ' + error.message });
        }
    }

    async getCamposFormulario(req, res) {
        try {
            const apostas = await regravalidacoeServices.getRegrasValidacao();

            return res.status(200).json({ apostas })
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async getEstrategiaGrafico(req, res) {
        const { id } = req.params;
        try {
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(Number(id));

            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            /*
            if (estrategia.updatedAt.toISOString().split('T')[0] == toDay() && estrategia.grafico_json != null) {
                return res.status(200).json(estrategia.grafico_json);
            }
                */

            const bilhetes = await bilheteServices.getBilhetesGrafico(estrategia);

            if (!bilhetes) {
                return res.status(404).json({ error: 'Bilhetes não encontrada!' });
            }

            let saldo = 0; // Saldo inicial

            const bilhetesComSaldo = bilhetes.map(bilhete => {
                saldo += parseFloat(bilhete.saldo_dia); // Somando saldo_dia ao saldo acumulado
                return {
                    ...bilhete,
                    saldo: parseFloat(saldo.toFixed(2)) // Adicionando saldo acumulado no objeto
                };
            });

            const dadosGrafico = {
                "nome": estrategia.nome,
                "descricao": estrategia.descricao,
                "dados": bilhetesComSaldo
            };

            await estrategiaServices.atualizaRegistro({ grafico_json: dadosGrafico }, { id: Number(id) });


            return res.status(200).json(dadosGrafico);
        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
    }

    async getEstrategia(req, res) {
        const { id } = req.params;
        try {
            const umRegistro = await estrategiaServices.getEstrategia(Number(id));

            if (!umRegistro) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            return res.status(200).json(umRegistro);
        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
    }

    async getBilhetes(req, res) {
        const { id } = req.params;
        const { page = 1, pageSize = 10 } = req.query; // Obtenha `page` e `pageSize` dos parâmetros de consulta

        try {
            // Chama o serviço com paginação
            const umRegistro = await estrategiaServices.getBilhetes(Number(id), Number(page), Number(pageSize), "DESC");

            if (!umRegistro) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

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

            const novaRegras = [];

            for (const regra of regras) {
                const paisesIds = [];
                const ligasIds = [];

                // Verifica se `aposta` está presente
                if (!regra.aposta) {
                    return res.status(400).json({ error: 'O campo aposta é obrigatório em cada regra!' });
                }

                // Validação de `aposta`
                const regravalidacoeExists = await regravalidacoeServices.pegaUmRegistro({
                    where: { id: regra.aposta }
                });

                if (!regravalidacoeExists) {
                    return res.status(400).json({ error: `O ID de aposta ${regra.aposta} não existe na tabela regravalidacoe.` });
                }

                // Validação de `pais`
                if (regra.pais && regra.pais.length > 0) {
                    const idsPais = regra.pais.map((p) => p.value);

                    const paisesValidos = await paiServices.pegaTodosOsRegistros({
                        where: { id: idsPais }
                    });

                    const paisesEncontrados = paisesValidos.map((p) => p.id);
                    const paisesNaoEncontrados = idsPais.filter((id) => !paisesEncontrados.includes(id));

                    if (paisesNaoEncontrados.length > 0) {
                        return res.status(400).json({
                            error: `Os IDs de país ${paisesNaoEncontrados.join(', ')} não existem no sistema.`
                        });
                    }

                    paisesIds.push(...paisesEncontrados);
                }

                // Validação de `liga`
                if (regra.liga && regra.liga.length > 0) {
                    const idsLiga = regra.liga.map((l) => l.value);

                    const ligasValidas = await ligaServices.pegaTodosOsRegistros({
                        where: { id: idsLiga }
                    });

                    const ligasEncontradas = ligasValidas.map((l) => l.id);
                    const ligasNaoEncontradas = idsLiga.filter((id) => !ligasEncontradas.includes(id));

                    if (ligasNaoEncontradas.length > 0) {
                        return res.status(400).json({
                            error: `Os IDs de liga ${ligasNaoEncontradas.join(', ')} não existem no sistema.`
                        });
                    }

                    ligasIds.push(...ligasEncontradas);
                }

                // Adiciona os dados validados à nova regra
                novaRegras.push({
                    ...regra,
                    validPaisesIds: paisesIds,
                    validLigasIds: ligasIds,
                });
            }

            // Cria a estratégia
            const novaEstrategia = await estrategiaServices.criaRegistro({ nome, descricao });

            if(!novaEstrategia || !novaEstrategia.id) return res.status(500).json({ error: 'Erro ao criar estratégia: Tente novamente!' });

            // Criando as regras a serem salvas no banco
            const regrasCriar = novaRegras.map(regra => ({
                estrategia_id: novaEstrategia.id,
                oddmin: regra.oddMin ? parseFloat(regra.oddMin) : null,
                oddmax: regra.oddMax ? parseFloat(regra.oddMax) : null,
                pai_id: regra.validPaisesIds.length > 0 ? regra.validPaisesIds.join(',') : null,
                liga_id: regra.validLigasIds.length > 0 ? regra.validLigasIds.join(',') : null,
                regravalidacoe_id: regra.aposta,
            }));

            // Cria as regras associadas à estratégia
            const regrasCriadas = await regraServices.criaVariosRegistros(regrasCriar);
            
            const apostas = await bilheteServices.montaBilhetes(novaEstrategia);

            // Calcula as estatiscica da estrategia
            const estrategiaComRegras = await estrategiaServices.geraEstistica(novaEstrategia);

            return res.status(201).json({ message: 'Estratégia criada com sucesso!', estrategia: estrategiaComRegras });
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

    async executarEstrategia(req, res) {
        try {

            const { id } = req.params;
            // Verifica se a estratégia existe
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(id);
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }
            await bilheteServices.montaBilhetes(estrategia);
            //await bilheteServices.montaBilhetes(estrategia, true);
            await estrategiaServices.geraEstistica(estrategia);
            const estrategiaA = await estrategiaServices.pegaUmRegistroPorId(id);
            return res.status(200).json({ message: 'Estratégia atualizada com sucesso!', estrategia: estrategiaA });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }
}

module.exports = EstrategiaController;
