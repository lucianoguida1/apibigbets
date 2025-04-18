'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dashboard extends Model {
        static associate(models) {
            // nenhuma associação por enquanto
        }
    }

    Dashboard.init({
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dados_json: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Dashboard',
        tableName: 'dashboards',
        paranoid: true
    });

    return Dashboard;
};
