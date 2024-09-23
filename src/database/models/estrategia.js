'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Estrategia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Estrategia.hasMany(models.Regra, {
        foreignKey: 'estrategia_id'
      });
    }
  }
  Estrategia.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.TEXT,
    taxaacerto: DataTypes.FLOAT,
    totalacerto: DataTypes.NUMBER,
    totalerro: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Estrategia',
    tableName: 'estrategias',
    paranoid: true
  });
  return Estrategia;
};