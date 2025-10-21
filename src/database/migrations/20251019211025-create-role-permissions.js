'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Roles', key: 'id' }, // ajuste p/ 'roles' se necessário
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Permissions', key: 'id' }, // ajuste p/ 'permissions' se necessário
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // timestamps
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // unique composto (evita duplicidade de vínculos)
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_id'],
      type: 'unique',
      name: 'uniq_role_permission',
    });

    // índices para performance nos joins
    await queryInterface.addIndex('role_permissions', ['role_id'], { name: 'idx_role_permissions_role_id' });
    await queryInterface.addIndex('role_permissions', ['permission_id'], { name: 'idx_role_permissions_permission_id' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('role_permissions', 'idx_role_permissions_permission_id');
    await queryInterface.removeIndex('role_permissions', 'idx_role_permissions_role_id');
    await queryInterface.removeConstraint('role_permissions', 'uniq_role_permission');
    await queryInterface.dropTable('role_permissions');
  }
};
