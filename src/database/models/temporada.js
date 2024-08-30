'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class temporadas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  temporadas.init({
    ano: DataTypes.STRING,
    inicio: DataTypes.DATE,
    fim: DataTypes.DATE,
    liga_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Temporada',
    tableName: 'temporadas',
    paranoid: true,
  });
  return temporadas;
};