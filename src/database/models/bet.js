'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Bet.hasMany(models.Odd,{
        foreignKey: 'bet_id'
      });
    }
  }
  Bet.init({
    nome: DataTypes.STRING,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Bet',
    tableName: 'bets',
    paranoid: true,
  });
  return Bet;
};