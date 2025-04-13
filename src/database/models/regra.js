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
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe_id', as: 'regra1' });
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe2_id', as: 'regra2' });
      Regra.belongsTo(models.Regravalidacoe, { foreignKey: 'regravalidacoe3_id', as: 'regra3' });
      //Regra.belongsTo(models.Pai, { foreignKey: 'pai_id' });
      //Regra.belongsTo(models.Liga, { foreignKey: 'liga_id' });
      //Regra.belongsTo(models.Time, { foreignKey: 'time_id' });
      Regra.belongsTo(models.Estrategia, { foreignKey: 'estrategia_id', as: 'estrategia' });
      Regra.belongsTo(models.Filtrojogo, { foreignKey: 'filtrojogo_id', as: 'filtroGeral' });
      Regra.belongsTo(models.Filtrojogo, { foreignKey: 'fjcasa_id', as: 'filtroCasa' });
      Regra.belongsTo(models.Filtrojogo, { foreignKey: 'fjfora_id', as: 'filtroFora' });
    }
  }
  Regra.init({
    pai_id: DataTypes.STRING,
    liga_id: DataTypes.STRING,
    temporada_id: DataTypes.STRING,
    time_id: DataTypes.STRING,
    regravalidacoe_id: DataTypes.NUMBER,
    regravalidacoe2_id: DataTypes.NUMBER,
    oddmin2: DataTypes.FLOAT,
    oddmax2: DataTypes.FLOAT,
    regravalidacoe3_id: DataTypes.NUMBER,
    oddmin3: DataTypes.FLOAT,
    oddmax3: DataTypes.FLOAT,
    estrategia_id: DataTypes.NUMBER,
    oddmin: DataTypes.NUMBER,
    oddmax: DataTypes.NUMBER,
    multipla: DataTypes.NUMBER,
    filtrojogo_id: DataTypes.NUMBER,
    fjcasa_id: DataTypes.NUMBER,
    fjfora_id: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'Regra',
    tableName: 'regras',
    paranoid: true
  });
  return Regra;
};
