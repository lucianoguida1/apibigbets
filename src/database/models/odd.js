'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class odds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  odds.init({
    nome: DataTypes.STRING,
    odd: DataTypes.FLOAT,
    tipoaposta_id: DataTypes.NUMBER,
    jogo_id: DataTypes.NUMBER,
    bet_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Odd',
    tableName: 'odds',
    paranoid: true,
  });
  return odds;
};