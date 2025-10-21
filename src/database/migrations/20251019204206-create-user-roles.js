'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }, // ajuste p/ 'users' se necessário
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Roles', key: 'id' }, // ajuste p/ 'roles' se necessário
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

    // unique composto para evitar duplicidades
    await queryInterface.addConstraint('user_roles', {
      fields: ['user_id', 'role_id'],
      type: 'unique',
      name: 'uniq_user_role',
    });

    // índices para joins/consultas
    await queryInterface.addIndex('user_roles', ['user_id'], { name: 'idx_user_roles_user_id' });
    await queryInterface.addIndex('user_roles', ['role_id'], { name: 'idx_user_roles_role_id' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('user_roles', 'idx_user_roles_role_id');
    await queryInterface.removeIndex('user_roles', 'idx_user_roles_user_id');
    await queryInterface.removeConstraint('user_roles', 'uniq_user_role');
    await queryInterface.dropTable('user_roles');
  }
};
