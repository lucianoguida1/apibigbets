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
      Bilhete.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id' });
      Bilhete.belongsToMany(models.Odd, { through: 'bilhetesodds', foreignKey: 'bilhete_id' });
      
    }
  }
  Bilhete.init({
    estrategia_id: DataTypes.NUMBER,
    alert: DataTypes.BOOLEAN,
    odd: DataTypes.NUMBER,
    status_bilhete: DataTypes.BOOLEAN,
    data: DataTypes.DATE,
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