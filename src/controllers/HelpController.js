const Controller = require('./Controller.js');
const HelpServices = require('../services/HelpServices.js');

const { z } = require('zod'); // Certifique-se de que o zod está instalado
const logTo = require('../utils/logTo.js');

const helpServices = new HelpServices();

const formSchema = z.object({
    nome: z.string().min(1, { message: "O nome é obrigatório." }),
    email: z.string().email({ message: "E-mail inválido." }),
    telefone: z.string().min(1, { message: "O Telefone é obrigatório." }),
    ajuda: z.string().min(1, { message: "O campo de ajuda é obrigatório." }),
});


class HelpController extends Controller {
    async createHelp(req, res) {
        try {
            // Valida os dados recebidos usando o schema
            const validatedData = formSchema.parse(req.body);
            
            // Cria o registro usando o serviço
            const newHelp = await helpServices.criaRegistro(validatedData);

            const mensagem = `Novo pedido de ajuda recebido: ${JSON.stringify(validatedData)}`;
            logTo(mensagem);
            
            return res.status(201).json(newHelp);
        } catch (error) {
            console.log('error', error)
            if (error.name === 'ZodError') {
                // Retorna erros de validação
                return res.status(400).json({ errors: error.errors });
            }
            // Retorna erro genérico
            return res.status(500).json({ message: 'Erro ao criar ajuda.', error: error.message });
        }
    }
}

module.exports = HelpController;