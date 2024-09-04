'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class requisicaopendentes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  requisicaopendentes.init({
    modulo: DataTypes.STRING,
    pagina: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'requisicaopendente',
    tableName: 'requisicaopendentes',
    paranoid: true,
  });
  return requisicaopendentes;
};