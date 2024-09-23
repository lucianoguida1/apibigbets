'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Regra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Regra.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id', as: 'estrategia' });
    }
  }
  Regra.init({
    pai_id: DataTypes.NUMBER,
    liga_id: DataTypes.NUMBER,
    temporada_id: DataTypes.NUMBER,
    time_id: DataTypes.NUMBER,
    odd_id: DataTypes.NUMBER,    
    estrategia_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Regra',
    tableName: 'regras',
    paranoid: true
  });
  return Regra;
};