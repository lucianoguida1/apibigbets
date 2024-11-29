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
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe_id', as: 'aposta' });
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe2_id', as: 'regra2' });
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe3_id', as: 'regra3' });
      //Regra.belongsTo(models.Pai, { foreignKey: 'pai_id' });
      //Regra.belongsTo(models.Liga, { foreignKey: 'liga_id' });
      //Regra.belongsTo(models.Time, { foreignKey: 'time_id' });
      Regra.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id', as: 'estrategia' });
    }
  }
  Regra.init({
    pai_id: DataTypes.STRING,
    liga_id: DataTypes.STRING,
    temporada_id: DataTypes.STRING,
    time_id: DataTypes.STRING,
    regravalidacoe_id: DataTypes.NUMBER,
    regravalidacoe2_id: DataTypes.NUMBER, // Nova coluna
    oddmin2: DataTypes.FLOAT,             // Nova coluna
    oddmax2: DataTypes.FLOAT,             // Nova coluna
    regravalidacoe3_id: DataTypes.NUMBER, // Nova coluna
    oddmin3: DataTypes.FLOAT,             // Nova coluna
    oddmax3: DataTypes.FLOAT,             // Nova coluna
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
