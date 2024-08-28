'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  bets.init({
    inicio: DataTypes.DATE,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Bet',
    tableName: 'bets',
    paranoid: true,
  });
  return bets;
};