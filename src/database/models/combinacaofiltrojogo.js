'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Combinacaofiltrojogo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Combinacaofiltrojogo.init({
    combinacao: DataTypes.STRING,
    nome: DataTypes.STRING,
    total_odds: DataTypes.FLOAT,
    positivos: DataTypes.INTEGER,
    negativos: DataTypes.INTEGER,
    taxa_acerto: DataTypes.FLOAT,
    media_odd: DataTypes.FLOAT,
    lucro: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Combinacaofiltrojogo',
    tableName: 'combinacaofiltrojogos',
  });
  return Combinacaofiltrojogo;
};