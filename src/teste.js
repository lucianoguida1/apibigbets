const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database/models').sequelize; // Ajustado para o novo diretório do Sequelize

// Gera combinações entre min e max elementos
function generateCombinations(arr, min = 2, max = 4) {
  const result = [];

  const combine = (prefix, rest, k) => {
    if (k === 0) {
      result.push(prefix);
      return;
    }
    for (let i = 0; i < rest.length; i++) {
      combine([...prefix, rest[i]], rest.slice(i + 1), k - 1);
    }
  };

  for (let k = min; k <= Math.min(max, arr.length); k++) {
    combine([], arr, k);
  }

  return result;
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

async function testarCombinacoes() {
  const startTime = Date.now(); // Marca o início do processamento

  const filtroIdsResult = await sequelize.query(
    'SELECT id FROM filtrojogos WHERE "deletedAt" IS NULL',
    { type: Sequelize.QueryTypes.SELECT }
  );
  const filtroIds = filtroIdsResult.map(row => row.id);

  const combinacoes = generateCombinations(filtroIds, 2, 4);
  let resultados = [];
  const total = combinacoes.length;

  for (let i = 0; i < total; i++) {
    const combo = combinacoes[i];
    const query = `
      WITH filtros_escolhidos AS (
        SELECT fd.data, fd.time_id
        FROM filtrojogodata fd
        WHERE fd.filtrojogo_id IN (${combo.join(',')})
        GROUP BY fd.data, fd.time_id
        HAVING COUNT(DISTINCT fd.filtrojogo_id) = ${combo.length}
      )
      SELECT 
        '${combo.join('-')}' AS combinacao,
        nome,
        COUNT(*) AS total_odds,
        COUNT(*) FILTER (WHERE status = TRUE) AS positivos,
        COUNT(*) FILTER (WHERE status = FALSE) AS negativos,
        ROUND(COUNT(*) FILTER (WHERE status = TRUE)::NUMERIC / COUNT(*) * 100, 2) AS taxa_acerto,
        AVG(odd) FILTER (WHERE status = TRUE) AS media_odd,
        ((AVG(odd) FILTER (WHERE status = TRUE) - 1) * COUNT(*) FILTER (WHERE status = TRUE) - COUNT(*) FILTER (WHERE status = FALSE)) AS lucro
      FROM mv_jogos_odds o
      JOIN filtros_escolhidos f
        ON o.data_jogo = f.data AND (o.casa_id = f.time_id OR o.fora_id = f.time_id)
      WHERE o.nome = 'Resultado Final - Empate'
      GROUP BY nome
      HAVING ((AVG(odd) FILTER (WHERE status = TRUE) - 1) * COUNT(*) FILTER (WHERE status = TRUE) - COUNT(*) FILTER (WHERE status = FALSE)) > 0;
    `;

    try {
      const result = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      resultados.push(...result);
    } catch (error) {
      console.error(`Erro ao executar combinação ${combo.join(',')}:`, error);
    }

    // Calcula progresso e ETA
    const percent = ((i + 1) / total * 100).toFixed(2);
    const elapsedSec = (Date.now() - startTime) / 1000;
    const estTotalSec = (elapsedSec / ((i + 1) || 1)) * total;
    const remainingSec = estTotalSec - elapsedSec;

    const timestamp = getTimestamp();
    const eta = new Date(Date.now() + remainingSec * 1000)
      .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    console.log(
      `[${timestamp}] Progresso: ${percent}% (${i + 1}/${total}) | ` +
      `Tempo decorrido: ${formatTime(elapsedSec)} | ` +
      `Restante: ${formatTime(remainingSec)} (ETA ~ ${eta})`
    );
  }

  resultados.sort((a, b) => b.lucro - a.lucro);
  console.table(resultados);

  // Salvar em arquivo CSV
  const csvPath = path.join(__dirname, 'resultados_combinacoes.csv');
  const headers = Object.keys(resultados[0]).join(',');
  const rows = resultados.map(r => Object.values(r).join(','));
  const csvContent = [headers, ...rows].join('\n');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`Resultados salvos em: ${csvPath}`);
}

// Executar o script
(async () => {
  try {
    await testarCombinacoes();
    process.exit();
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
})();
