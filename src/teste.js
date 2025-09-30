const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database/models').sequelize;
const CombinacaoFiltroJogoServices = require('./services/CombinacaoFiltroJogoServices.js');
const { type } = require('os');
const combinacaoFJ = new CombinacaoFiltroJogoServices();

// Gera combinações entre min e max elementos
function generateCombinations(arr, min = 1, max = 4) {
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
  const startTime = Date.now();

  console.log(`[INFO] Carregando dados do banco...`);

  // Limpa a tabela de filtro jogos
  await sequelize.query(
    `DELETE FROM public.combinacaofiltrojogos`,
    { type: Sequelize.QueryTypes.DELETE }
  )

  // Carregar tabelas principais
  const filtroJogos = await sequelize.query(
    'SELECT id FROM filtrojogos WHERE "deletedAt" IS NULL',
    { type: Sequelize.QueryTypes.SELECT }
  );
  const filtroIds = filtroJogos.map(r => r.id);

  const filtroJogosData = await sequelize.query(
    'SELECT filtrojogo_id, data, time_id FROM filtrojogodata',
    { type: Sequelize.QueryTypes.SELECT }
  );

  const jogosOdds = await sequelize.query(
    `SELECT j.data AS data_jogo,
            j.casa_id,
            j.fora_id,
            o.odd,
            o.status,
            CONCAT(t.nome, ' -- ', o.nome) AS nome
     FROM jogos j
     INNER JOIN odds o ON o.jogo_id = j.id AND o.status IS NOT NULL
     INNER JOIN tipoapostas t ON t.id = o.tipoaposta_id`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  console.log(`[INFO] Dados carregados: filtros=${filtroIds.length}, filtrojogodata=${filtroJogosData.length}, odds=${jogosOdds.length}`);

  // Index filtrojogodata
  const filtroMap = new Map();
  for (let fd of filtroJogosData) {
    const key = `${fd.data}_${fd.time_id}`;
    if (!filtroMap.has(key)) filtroMap.set(key, new Set());
    filtroMap.get(key).add(fd.filtrojogo_id);
  }

  // Index odds por chave (data+time_id)
  const oddsMap = new Map();
  for (let o of jogosOdds) {
    const keyCasa = `${o.data_jogo}_${o.casa_id}`;
    const keyFora = `${o.data_jogo}_${o.fora_id}`;

    if (!oddsMap.has(keyCasa)) oddsMap.set(keyCasa, []);
    if (!oddsMap.has(keyFora)) oddsMap.set(keyFora, []);

    oddsMap.get(keyCasa).push(o);
    oddsMap.get(keyFora).push(o);
  }

  // Gerar combinações
  const combinacoes = generateCombinations(filtroIds, 2, 4);
  let resultados = [];
  const total = combinacoes.length;

  console.log(`[INFO] Total de combinações a processar: ${total}`);

  for (let i = 0; i < total; i++) {
    const combo = combinacoes[i];

    // Seleciona (data,time) que possuem todos os ids da combinação
    const escolhidos = [];
    for (let [key, ids] of filtroMap.entries()) {
      if (combo.every(c => ids.has(c))) escolhidos.push(key);
    }

    if (escolhidos.length === 0) continue;

    // Recupera odds diretamente do Map
    let selecionados = [];
    for (let key of escolhidos) {
      if (oddsMap.has(key)) {
        selecionados.push(...oddsMap.get(key));
      }
    }

    if (selecionados.length === 0) continue;

    // Agrupar por nome
    const grupos = {};
    for (let o of selecionados) {
      if (!grupos[o.nome]) grupos[o.nome] = [];
      grupos[o.nome].push(o);
    }

    for (let nome in grupos) {
      const arr = grupos[nome];
      const totalOdds = arr.length;
      const positivos = arr.filter(o => o.status === true).length;
      const negativos = arr.filter(o => o.status === false).length;
      const mediaOdd = positivos > 0
        ? arr.filter(o => o.status === true).reduce((a, b) => a + b.odd, 0) / positivos
        : 0;
      const lucro = ((mediaOdd - 1) * positivos) - negativos;
      const taxaAcerto = totalOdds > 0 ? (positivos / totalOdds) * 100 : 0;

      if (lucro > 0) {
        const json = {
          combinacao: combo.join('-'),
          nome,
          total_odds: totalOdds,
          positivos,
          negativos,
          taxa_acerto: taxaAcerto.toFixed(2),
          media_odd: mediaOdd.toFixed(2),
          lucro: lucro.toFixed(2)
        }
        await combinacaoFJ.criaRegistro(json)
      }
    }

    // Progresso
    if (i % 50 === 0 || i === total - 1) {
      const percent = ((i + 1) / total * 100).toFixed(2);
      const elapsedSec = (Date.now() - startTime) / 1000;
      const estTotalSec = (elapsedSec / ((i + 1) || 1)) * total;
      const remainingSec = estTotalSec - elapsedSec;
      const eta = new Date(Date.now() + remainingSec * 1000)
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      console.log(
        `[${getTimestamp()}] Progresso: ${percent}% (${i + 1}/${total}) | ` +
        `Tempo decorrido: ${formatTime(elapsedSec)} | ` +
        `Restante: ${formatTime(remainingSec)} (ETA ~ ${eta})`
      );
    }
  }

}

(async () => {
  try {
    await testarCombinacoes();
    process.exit();
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
})();


