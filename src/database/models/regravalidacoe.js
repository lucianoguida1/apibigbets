'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Regravalidacoe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Regravalidacoe.hasMany(models.Odd, {
        foreignKey: 'regra_id'
      });

      //Tem o ID
      Regravalidacoe.belongsTo(models.Tipoaposta, {
        foreignKey: 'tipoaposta_id'
      });
    }
  }
  Regravalidacoe.init({
    nome: DataTypes.STRING,
    regra: DataTypes.STRING,
    descricao: DataTypes.STRING,
    tipoaposta_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'regravalidacoe',
    tableName: 'regravalidacoes',
    paranoid: true
  });
  return Regravalidacoe;
};