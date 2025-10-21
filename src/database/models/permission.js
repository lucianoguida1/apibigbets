'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Permission.belongsToMany(models.Role, { through: 'role_permissions', foreignKey: 'permission_id' });
    }
  }
  Permission.init({
    key: { type: DataTypes.STRING, unique: true }, // ex: 'estrategia.read'
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Permission',
    paranoid: true,
    tableName: 'permissions'
  });
  return Permission;
};