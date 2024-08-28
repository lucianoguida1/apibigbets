'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class times_temporadas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  times_temporadas.init({
    id_time: DataTypes.NUMBER,
    temporada_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Timestemporada',
    tableName: 'timestemporadas',
    paranoid: true,
  });
  return times_temporadas;
};