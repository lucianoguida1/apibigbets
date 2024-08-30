'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class times extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  times.init({
    nome: DataTypes.STRING,
    logo: DataTypes.TEXT,
    pai_id: DataTypes.NUMBER,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Time',
    tableName: 'times',
    paranoid: true,
  });
  return times;
};