'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bilhetesodd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Tem o ID
      Bilhetesodd.belongsTo(models.Bilhete, { foreignKey: 'bilhete_id' });
      Bilhetesodd.belongsTo(models.Odd, { foreignKey: 'odd_id' });
    }
  }
  Bilhetesodd.init({
    bilhete_id: DataTypes.NUMBER,
    odd_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Bilhetesodd',
    tableName: 'bilhetesodds',
    paranoid: true,
    uniqueKeys: {
      unique_bilhete_odd: {
        fields: ['bilhete_id', 'odd_id'] // Garante unicidade entre bilhete_id e odd_id
      }
    }
  });
  return Bilhetesodd;
};