'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Filtrojogos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Filtrojogos.hasMany(models.Regra, { foreignKey: 'filtrojogo_id' });
    }
  }
  Filtrojogos.init({
    nome: DataTypes.STRING,
    sql: DataTypes.TEXT,
    so_casa: DataTypes.BOOLEAN,
    so_fora: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Filtrojogo',
    tableName: 'filtrojogos',
    paranoid: true,
  });
  return Filtrojogos;
};