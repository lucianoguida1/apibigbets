'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jogos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  jogos.init({
    casa_id: DataTypes.NUMBER,
    fora_id: DataTypes.NUMBER,
    gols_casa: DataTypes.NUMBER,
    gols_fora: DataTypes.NUMBER,
    datahora: DataTypes.DATE,
    data: DataTypes.STRING,
    status: DataTypes.STRING,
    temporada_id: DataTypes.NUMBER,
    id_sports: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Jogo',
    tableName: 'jogos',
    paranoid: true,
  });
  return jogos;
};