const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const JogoServices = require('../services/JogoServices.js');

const jogoServices = new JogoServices();
const { z } = require('zod');

const formSchema = z.object({
    gols_casa: z.number().min(0, { message: "Os gols da casa devem ser no mínimo 0." }),
    gols_fora: z.number().min(0, { message: "Os gols fora devem ser no mínimo 0." }),
});

class JogosController extends Controller {
    async getJogosSemPlacar(req, res) {
        try {
            const { count, rows } = await jogoServices.jogosSemPlacar();
            return res.status(200).json({
                "status": "success",
                "message": "Dados retornados com sucesso!",
                "statusCode": 200,
                "pagination": {},
                "data": {
                    "count": count,
                    "rows": rows
                }
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar dados",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async setJogosSemPlacar(req, res) {
        try {
            // Validação do formulário
            const validationResult = formSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Dados inválidos",
                    "errorCode": 400,
                    "details": validationResult.error.errors
                });
            }

            const { id, gols_casa, gols_fora } = req.body;

            // Verificar se o jogo existe e se gols_casa está null
            const jogo = await jogoServices.pegaUmRegistroPorId(id); // Método fictício para buscar o jogo pelo ID
            if (!jogo) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Jogo não encontrado",
                    "errorCode": 404
                });
            }

            if (jogo.gols_casa !== null) {
                return res.status(400).json({
                    "status": "error",
                    "message": "O jogo já possui placar definido",
                    "errorCode": 400
                });
            }

            // Atualizar o placar do jogo
            await jogoServices.atualizarPlacar(id, { gols_casa, gols_fora }); // Método fictício para atualizar o placar

            return res.status(201).json({
                "status": "success",
                "message": "Placar atualizado com sucesso!",
                "statusCode": 201
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao processar a solicitação",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

    async setAdiado(req, res) {
        try {
            const { id } = req.body;

            // Verificar se o jogo existe
            const jogo = await jogoServices.pegaUmRegistroPorId(id); // Método fictício para buscar o jogo pelo ID
            if (!jogo) {
                return res.status(404).json({
                    "status": "error",
                    "message": "Jogo não encontrado",
                    "errorCode": 404
                });
            }

            jogo.adiado = true; // Alterna o status de adiado
            jogo.status = "adiado"; // Atualiza o status do jogo para "adiado"
            await jogo.save(); // Salva as alterações no banco de dados

            return res.status(200).json({
                "status": "success",
                "message": "Status de adiado atualizado com sucesso!",
                "statusCode": 200
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao processar a solicitação",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

}

module.exports = JogosController;