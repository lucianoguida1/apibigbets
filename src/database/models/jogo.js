'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jogo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Jogo.hasMany(models.Gol, {foreignKey: 'jogo_id'});
      Jogo.hasMany(models.Odd, {foreignKey: 'jogo_id'});
      Jogo.hasMany(models.Bilhete, {foreignKey: 'jogo_id'});

      //Tem o ID
      Jogo.belongsTo(models.Time, {foreignKey: 'casa_id',as: 'casa'});
      Jogo.belongsTo(models.Time, {foreignKey: 'fora_id',as: 'fora'});
      Jogo.belongsTo(models.Temporada, {foreignKey: 'temporada_id'});
    }
  }
  Jogo.init({
    casa_id: DataTypes.NUMBER,
    fora_id: DataTypes.NUMBER,
    gols_casa: DataTypes.NUMBER,
    gols_fora: DataTypes.NUMBER,
    datahora: DataTypes.DATE,
    data: DataTypes.STRING,
    status: DataTypes.STRING,
    temporada_id: DataTypes.NUMBER,
    id_sports: DataTypes.NUMBER,
    halftime: DataTypes.STRING,
    fulltime: DataTypes.STRING,
    extratime: DataTypes.STRING,
    penalty: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Jogo',
    tableName: 'jogos',
    paranoid: true,
  });
  return Jogo;
};