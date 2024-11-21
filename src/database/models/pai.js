'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Pai.hasMany(models.Liga, {
        foreignKey: 'pai_id'
      });

      Pai.hasMany(models.Time, {
        foreignKey: 'pai_id'
      });
    }
  }
  Pai.init({
    nome: DataTypes.STRING,
    code: DataTypes.STRING,
    logo: DataTypes.TEXT,
    dados_json: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'Pai',
    tableName: 'pais',
    paranoid: true,
  });
  return Pai;
};