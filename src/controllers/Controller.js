class Controller {
    constructor (entidadeService) {
        this.entidadeService = entidadeService
    }

    async pegaTodos(req, res){
        try {
            const registros = await this.entidadeService.pegaTodos();
            return res.status(200).json(registros);
        } catch (error) {
            console.log('Erro ao listar:', error);
            return res.status(500).json({ error: 'Erro ao listar' });
        }
    }
    // async pegaUmPorId(req, res) {
    //   const { id } = req.params;
    //   try {
    //     const umRegistro = await this.entidadeService.pegaUmRegistroPorId(Number(id));
    //     return res.status(200).json(umRegistro);
    //   } catch (erro) {
    //     // erro
    //   }
    // }

    // async criaNovo(req, res) {
    //   const dadosParaCriacao = req.body;
    //   try {
    //     const novoRegistroCriado = await this.entidadeService.criaRegistro(dadosParaCriacao);
    //     return res.status(200).json(novoRegistroCriado);
    //   } catch (erro) {
    //     // erro
    //   }
    // }

    async atualiza(req, res) {
        const { id } = req.params;
        const dadosAtualizados = req.body;
        try {
            //isUpdatedc
            const foiAtualizado = await this.entidadeService.atualizaRegistro(dadosAtualizados, Number(id));
            console.log('aaaa');
            if (!foiAtualizado) {
                return res.status(400).json({ mensagem: 'registro não foi atualizado' });
            }
            return res.status(200).json({ mensagem: 'Atualizado com sucesso' });
        } catch (error) {
            console.log('Erro ao atualizar:', error);
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }

    // async exclui(req, res) {
    //   const { id } = req.params;
    //   try {
    //     await this.entidadeService.excluiRegistro(Number(id));
    //     return res.status(200).json({ mensagem: `id ${id} deletado` });


    //   } catch (error) {
    //     return res.status(500).json(error.message);
    //   }
    // }
}

module.exports = Controller;