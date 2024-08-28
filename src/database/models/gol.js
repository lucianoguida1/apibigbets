'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class gols extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  gols.init({
    tempo: DataTypes.STRING,
    casa: DataTypes.NUMBER,
    fora: DataTypes.NUMBER,
    jogo_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Gol',
    tableName: 'gols',
    paranoid: true,
  });
  return gols;
};