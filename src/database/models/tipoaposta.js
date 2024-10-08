'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tipoaposta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Tipoaposta.hasMany(models.Odd, {
        foreignKey: 'tipoaposta_id'
      });
    }
  }
  Tipoaposta.init({
    nome: DataTypes.STRING,
    name: DataTypes.STRING,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Tipoaposta',
    tableName: 'tipoapostas',
    paranoid: true,
  });
  return Tipoaposta;
};