'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Estrategia extends Model {
    static associate(models) {
      Estrategia.hasMany(models.Bilhete, { foreignKey: 'estrategia_id' });
      Estrategia.hasMany(models.Regra, { foreignKey: 'estrategia_id' });
    }
  }
  Estrategia.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.TEXT,
    taxaacerto: DataTypes.FLOAT,
    totalacerto: DataTypes.INTEGER,
    totalerro: DataTypes.INTEGER,
    odd_media: DataTypes.FLOAT,
    odd_minima: DataTypes.FLOAT,
    odd_maxima: DataTypes.FLOAT,
    media_odd_vitoriosa: DataTypes.FLOAT,
    media_odd_derrotada: DataTypes.FLOAT,
    total_apostas: DataTypes.INTEGER,
    frequencia_apostas_dia: DataTypes.FLOAT,
    sequencia_vitorias: DataTypes.INTEGER,
    sequencia_derrotas: DataTypes.INTEGER,
    total_vitorias: DataTypes.INTEGER,
    total_derrotas: DataTypes.INTEGER,
    lucro_total: DataTypes.FLOAT,
    qtde_usuarios: DataTypes.INTEGER,
    media_sequencia_vitorias: DataTypes.FLOAT,
    maior_derrotas_dia: DataTypes.INTEGER,
    maior_derrotas_semana: DataTypes.INTEGER,
    maior_vitorias_dia: DataTypes.INTEGER,
    maior_vitorias_semana: DataTypes.INTEGER,
    grafico_json: DataTypes.JSON,
    chat_id: DataTypes.STRING, // Novo campo
    link_grupo: DataTypes.STRING,
    chave_grupo: {
      type: DataTypes.STRING,
      defaultValue: () => Math.random().toString(36).substr(2, 4) // Gera uma chave única de 4 dígitos
    } // Novo campo
  }, {
    sequelize,
    modelName: 'Estrategia',
    tableName: 'estrategias',
    paranoid: true
  });
  return Estrategia;
};
