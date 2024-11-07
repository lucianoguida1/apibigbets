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
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe_id' });
      Regra.belongsTo(models.Pai, { foreignKey: 'pai_id' });
      Regra.belongsTo(models.Liga, { foreignKey: 'liga_id' });
      Regra.belongsTo(models.Time, { foreignKey: 'time_id' });
      Regra.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id', as: 'estrategia' });
    }
  }
  Regra.init({
    pai_id: DataTypes.NUMBER,
    liga_id: DataTypes.NUMBER,
    temporada_id: DataTypes.NUMBER,
    time_id: DataTypes.NUMBER,
    regravalidacoe_id: DataTypes.NUMBER,    
    estrategia_id: DataTypes.NUMBER,
    oddmin: DataTypes.NUMBER,
    oddmax: DataTypes.NUMBER,
    multipla: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'Regra',
    tableName: 'regras',
    paranoid: true
  });
  return Regra;
};