const dataSource = require('../database/models');

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
  /*
  async pegaUmRegistro(where) {
    return dataSource[this.model].findOne({ where: { ...where } });
  }
  */
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
    return dataSource[this.model].bulkCreate(dadosDosRegistros);
  }

  async atualizaRegistrosEmMassa(arrayDeAtualizacoes) {
    const promises = arrayDeAtualizacoes.map(async (registro) => {
      const { id, ...camposParaAtualizar } = registro;
      return dataSource[this.model].update(
        camposParaAtualizar,
        { where: { id } } // Atualiza o registro correspondente ao id
      );
    });

    // Executa todas as atualizações de uma vez
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
