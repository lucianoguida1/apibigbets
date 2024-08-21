'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consulta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Consulta.init({
    chave: DataTypes.STRING,
    consulta: DataTypes.TEXT,
    tratamento: DataTypes.TEXT,
    basededados: DataTypes.STRING,
    parametros: DataTypes.TEXT,
    public: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Consulta',
    tableName: 'consultas',
    paranoid: true,
  });
  return Consulta;
};