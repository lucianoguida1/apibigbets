const { Op } = require('sequelize'); // Importando os operadores do Sequelize
const Controller = require('./Controller.js');
const Services = require('../services/Services.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const JogoServices = require('../services/JogoServices.js');


const estrategiaServices = new EstrategiaServices();
const jogoServices = new JogoServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }
    // Função para mapear o operador da comparação
    getSequelizeOperator(condicao) {
        switch (condicao) {
            case '>':
                return Op.gt;
            case '>=':
                return Op.gte;
            case '<':
                return Op.lt;
            case '<=':
                return Op.lte;
            case '=':
                return Op.eq;
            case '!=':
                return Op.ne;
            default:
                throw new Error(`Operador ${condicao} não suportado`);
        }
    }
    async executarEstrategia(req, res) {
        try {
            // Verificar se o ID foi passado
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID da estratégia não fornecido!' });
            }

            // Buscar a estratégia e suas regras associadas
            const estrategia = await estrategiaServices.pegaUmRegistroPorId(req.params.id);
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }
            const regras = await estrategia.getRegras();
            let jogos = [];
            let jogosId = null;

            // Construir dinamicamente as queries com base nas regras
            let conexao = null;
            let ids = [];
            if (regras.length > 0) {
                for (const regra of regras) {
                    const tabela = regra.tabela;
                    const campo1 = regra.campo1;
                    const condicao1 = regra.condicao1; // Condição que foi salva no banco (ex: <, >, =)
                    const valor1 = regra.valor1; // Valor da comparação
                    const campo2 = regra.campo2;
                    const condicao2 = regra.condicao2;
                    const valor2 = regra.valor2;
                    const serviceTable = new Services(tabela);
                    // Usar a função para pegar o operador Sequelize
                    const operador1 = this.getSequelizeOperator(condicao1);

                    // Criar o objeto `where` para a query com a primeira condição
                    let whereCondition = {
                        [campo1]: { [operador1]: valor1 }
                    };

                    // Se `campo2`, `condicao2`, e `valor2` não forem nulos, adicionar ao `where`
                    if (campo2 && condicao2 && valor2) {
                        const operador2 = this.getSequelizeOperator(condicao2);
                        whereCondition[campo2] = { [operador2]: valor2 };
                    }

                    // Executar a busca usando o operador dinâmico
                    let resultados = [];
                    if (conexao == null) {
                        resultados = await serviceTable.pegaTodosOsRegistros(whereCondition);
                    } else {
                        whereCondition[conexao] = { [Op.in]: ids };
                        resultados = await serviceTable.pegaTodosOsRegistros(whereCondition);
                    }
                    console.log(resultados.length)
                    let idsAtuais = [];
                    if (resultados) {
                        for (const result of resultados) {
                            let idJogoAdd = null;
                            ids.push(result.id);
                            if (tabela === 'Jogo') {
                                idJogoAdd = result.id;
                            } else if (result.jogo_id) {
                                idJogoAdd = result.jogo_id;
                            }
                            idsAtuais.push(idJogoAdd);
                        }
                        conexao = tabela.toLowerCase() + "_id";
                    }


                    jogosId = idsAtuais;
                    /*/ Fazer a interseção com os IDs anteriores
                if (jogosId === null) {
                    // Se for a primeira regra, inicializamos com os IDs atuais
                    jogosId = idsAtuais;
                } else {
                    // Se não for a primeira, fazemos a interseção
                    jogosId = jogosId.filter(id => idsAtuais.includes(id));
                }*/
                }
                console.log(jogosId);
                // Fazer a busca final com todos os IDs de jogos que correspondem às regras
                if (jogosId.length > 0) {
                    jogos = await jogoServices.jogoEstruturadoIds(jogosId);
                }
                return res.status(200).json(jogos);
            }

            return res.status(404).json({ error: 'Estratégia não contem regras!' });
        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }
}

module.exports = EstrategiaController;
