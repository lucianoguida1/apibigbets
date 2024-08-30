'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ligas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ligas.init({
    nome: DataTypes.STRING,
    logo: DataTypes.TEXT,
    id_sports: DataTypes.NUMBER,
    pai_id: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'Liga',
    tableName: 'ligas',
    paranoid: true,
  });
  return Ligas;
};