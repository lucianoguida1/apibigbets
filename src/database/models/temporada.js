'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Temporada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Temporada.hasMany(models.Timestemporada, {
        foreignKey: 'temporada_id'
      });
      
      Temporada.hasMany(models.Jogo, {
        foreignKey: 'temporada_id'
      });

      //Tem o ID
      Temporada.belongsTo(models.Liga, {
        foreignKey: 'liga_id'
      });
    }
  }
  Temporada.init({
    ano: DataTypes.STRING,
    inicio: DataTypes.DATE,
    fim: DataTypes.DATE,
    liga_id: DataTypes.NUMBER,
    dados_json: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'Temporada',
    tableName: 'temporadas',
    paranoid: true,
  });
  return Temporada;
};