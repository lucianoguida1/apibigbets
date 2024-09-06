'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Tem o ID
      Gol.belongsTo(models.Jogo, {
        foreignKey: 'jogo_id'
      });
    }
  }
  Gol.init({
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
  return Gol;
};