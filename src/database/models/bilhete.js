'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bilhete extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      //Tem o ID
      Bilhete.belongsTo(models.Jogo, { foreignKey: 'jogo_id' });
      Bilhete.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id' });
      Bilhete.belongsTo(models.Odd, { foreignKey: 'odd_id' });
    }
  }
  Bilhete.init({
    bilhete_id: DataTypes.NUMBER,
    jogo_id: DataTypes.NUMBER,
    estrategia_id: DataTypes.NUMBER,
    alert: DataTypes.BOOLEAN,
    odd_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Bilhete',
    tableName: 'bilhetes',
    paranoid: true,
    uniqueKeys: {
      unique_jogo_estrategia: {
        fields: ['jogo_id', 'estrategia_id']
      }
    }
  });
  return Bilhete;
};