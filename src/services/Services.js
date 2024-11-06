const dataSource = require('../database/models');
const { Op } = require('sequelize');

class Services {
  constructor(nomeDoModel) {
    this.model = nomeDoModel;
  }

  async pegaTodosOsRegistros(where = {}) {
    return dataSource[this.model].findAll({ where: { ...where } });
  }

  async pegaRegistrosPorEscopo(escopo) {
    return dataSource[this.model].scope(escopo).findAll();
  }

  async pegaUmRegistroPorId(id) {
    return dataSource[this.model].findByPk(id);
  }

  async pegaRegistrosDeHoje(date = new Date()) {
    // Define o início e o final do dia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);  // Início do dia (meia-noite)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);  // Final do dia
    return dataSource[this.model].findAll({ where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } });
  }

  async pegaUmRegistro(options) {
    return dataSource[this.model].findOne({ ...options });
  }

  async pegaEContaRegistros(options) {
    return dataSource[this.model].findAndCountAll({ ...options });
  }

  async criaRegistro(dadosDoRegistro) {
    return dataSource[this.model].create(dadosDoRegistro);
  }

  async criaVariosRegistros(dadosDosRegistros) {
    return dataSource[this.model].bulkCreate(dadosDosRegistros, {
      ignoreDuplicates: true
    });
  }

  async atualizaRegistrosEmMassa(arrayDeAtualizacoes) {
    const promises = arrayDeAtualizacoes.map(async (registro) => {
      try {
        const { id, ...camposParaAtualizar } = registro;
        const resultado = await dataSource[this.model].update(
          camposParaAtualizar,
          { where: { id } }
        );
        return resultado;
      } catch (error) {
        console.error(`Erro ao atualizar registro: ${id}`, error);
        throw error; // Opcional: relançar o erro
      }
    });
    return Promise.all(promises);
  }


  async atualizaRegistro(dadosAtualizados, where) {
    const listadeRegistrosAtualizados = await dataSource[this.model].update(dadosAtualizados, {
      where: { ...where }
    });
    if (listadeRegistrosAtualizados[0] === 0) {
      return false;
    }
    return true;
  }

  async excluiRegistro(id) {
    return dataSource[this.model].destroy({ where: { id: id } });
  }
}

module.exports = Services;
