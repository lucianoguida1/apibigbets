'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Timestemporadas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Tem o ID
      Timestemporadas.belongsTo(models.Time, {
        foreignKey: 'time_id'
      });
      Timestemporadas.belongsTo(models.Temporada, {
        foreignKey: 'temporada_id'
      });
    }
  }
  Timestemporadas.init({
    time_id: DataTypes.NUMBER,
    temporada_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Timestemporada',
    tableName: 'timestemporadas',
    paranoid: true,
  });
  return Timestemporadas;
};