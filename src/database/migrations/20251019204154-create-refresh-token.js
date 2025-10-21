'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refreshtokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      token_hash: {
        type: Sequelize.STRING
      },
      family_id: {
        type: Sequelize.UUID
      },
      is_revoked: {
        type: Sequelize.BOOLEAN
      },
      expires_at: {
        type: Sequelize.DATE
      },
      created_by_ip: {
        type: Sequelize.STRING
      },
      replaced_by_token_hash: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refreshtokens');
  }
};