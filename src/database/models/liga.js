'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Liga extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Não tem o ID
      Liga.hasMany(models.Temporada, {
        foreignKey: 'liga_id'
      });

      //Tem o ID
      Liga.belongsTo(models.Pai, {
        foreignKey: 'pai_id'
      });
    }
  }
  Liga.init({
    nome: DataTypes.STRING,
    logo: DataTypes.TEXT,
    pai_id: DataTypes.NUMBER,
    id_sports: DataTypes.NUMBER,
    dados_json: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'Liga',
    tableName: 'ligas',
    paranoid: true,
  });
  return Liga;
};