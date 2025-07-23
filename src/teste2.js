const { Sequelize } = require('sequelize');
const fs = require('fs');
const sequelize = require('./database/models').sequelize;
const Filtrojogo = require('./services/FiltrojogoServices.js');

const filtrojogoService = new Filtrojogo();

async function processarFiltros() {
  const filtros = await filtrojogoService.pegaTodosOsRegistros();
  await sequelize.query('DELETE FROM public.filtrojogodata WHERE id >= 1;', {
    type: sequelize.QueryTypes.DELETE
  });

  for (const filtro of filtros) {
    if (filtro.sql.includes('@data')) {
      const startDate = new Date('2024-09-26');
      const endDate = new Date();
      const dados_json = {};

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const formattedDate = d.toISOString().split('T')[0];
        let sqlF = filtro.sql.replace(/@data/g, `'${formattedDate}'`);
        sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtro.id}'`);

        const results = await sequelize.query(sqlF, {
          type: sequelize.QueryTypes.SELECT,
        });

        dados_json[formattedDate] = results;
      }

      // Se quiser salvar no banco:
      // filtro.dados_json = dados_json;
      // await filtro.save();
      console.log(`Processado filtro ${filtro.id}`);
    }
  }

}

// Executa o script
processarFiltros()
  .then(() => {
    console.log('Processamento finalizado');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro ao processar filtros:', err);
    process.exit(1);
  });
