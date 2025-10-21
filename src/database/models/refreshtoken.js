'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RefreshToken.init({
    user_id: DataTypes.INTEGER,
    token_hash: DataTypes.STRING,
    family_id: DataTypes.UUID,
    is_revoked: DataTypes.BOOLEAN,
    expires_at: DataTypes.DATE,
    created_by_ip: DataTypes.STRING,
    replaced_by_token_hash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refreshtokens',
    paranoid: true,
  });
  return RefreshToken;
};