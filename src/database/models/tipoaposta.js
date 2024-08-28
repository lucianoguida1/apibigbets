'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipoapostas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tipoapostas.init({
    nome: DataTypes.STRING,
    name: DataTypes.STRING,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Tipoaposta',
    tableName: 'tipoapostas',
    paranoid: true,
  });
  return tipoapostas;
};