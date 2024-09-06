'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Time extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Time.hasMany(models.Timestemporada, {
        foreignKey: 'time_id'
      });
      Time.hasMany(models.Jogo, {
        foreignKey: 'casa_id',
        as: 'jogosCasa'
      });
      Time.hasMany(models.Jogo, {
        foreignKey: 'fora_id',
        as: 'jogosFora'
      });
      
      Time.belongsTo(models.Pai, {
        foreignKey: 'pai_id'
      });
    }
    async getJogos() {
      const jogosCasa = await this.getJogosCasa();
      const jogosFora = await this.getJogosFora();
      return [...jogosCasa, ...jogosFora];
    }
  }
  Time.init({
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
  return Time;
};