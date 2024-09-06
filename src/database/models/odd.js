'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Odd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Tem o ID
      Odd.belongsTo(models.Jogo, {
        foreignKey: 'jogo_id'
      });
      Odd.belongsTo(models.Bet, {
        foreignKey: 'bet_id'
      });
    }
  }
  Odd.init({
    nome: DataTypes.STRING,
    odd: DataTypes.FLOAT,
    tipoaposta_id: DataTypes.NUMBER,
    jogo_id: DataTypes.NUMBER,
    bet_id: DataTypes.NUMBER,
    regra_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Odd',
    tableName: 'odds',
    paranoid: true,
  });
  return Odd;
};