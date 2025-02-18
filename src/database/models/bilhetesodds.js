'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bilhetesodds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      //Tem o ID
      Bilhete.belongsTo(models.Bilhete, { foreignKey: 'bilhete_id' });
      Bilhete.belongsTo(models.Odd, { foreignKey: 'odd_id' });
    }
  }
  Bilhetesodds.init({
    bilhete_id: DataTypes.NUMBER,
    odd_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Bilhetesodds',
    tableName: 'bilhetesodds',
    paranoid: true
  });
  return Bilhetesodds;
};