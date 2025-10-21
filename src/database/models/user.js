'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Role, { through: 'user_roles', foreignKey: 'user_id' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password_hash: DataTypes.STRING,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    // extras úteis:
    last_login_at: DataTypes.DATE,
    // harden:
    password_changed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    paranoid: true,
  });
  return User;
};