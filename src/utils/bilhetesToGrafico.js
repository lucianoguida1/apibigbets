module.exports = (bilhetes) => {
    const QTD_MESES = 4;

    // ---------- Utils ----------
    const toISO = (d) => {
        const x = new Date(d);
        const y = x.getFullYear();
        const m = String(x.getMonth() + 1).padStart(2, '0');
        const dd = String(x.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
    const nomeMesPT = (idx1) => ([
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ])[idx1 - 1];

    // ---------- Retorno vazio ----------
    const empty = () => ({
        SaldoAcumulado: [],
        SaldoFixo: [],
        BilhetesGanhos: [],
        BilhetesPerdidos: [],
        NumApostas: [],
        SaldoUltimos7Dias: [],
        // agora: objeto com nome do mês -> array de pontos acumulados (dia a dia)
        SaldoAcumulado4Meses: {}
    });

    if (!Array.isArray(bilhetes) || bilhetes.length === 0) return empty();

    // Normaliza e acha data mais recente
    const datasOrdenadas = bilhetes
        .map(b => new Date(b.data))
        .filter(d => !isNaN(d))
        .sort((a, b) => b - a);

    if (datasOrdenadas.length === 0) return empty();

    const dataMaisRecente = new Date(datasOrdenadas[0].toDateString());
    const inicioJanela = startOfMonth(addMonths(dataMaisRecente, -(QTD_MESES - 1)));
    const fimJanela = endOfMonth(dataMaisRecente); // usado em meses anteriores; o mês atual será limitado

    // ---------- Séries "clássicas" que você já consome ----------
    let acumuladoGlobal = 0;
    let saldoReaplicado = 10;
    let apostaReaplicada = saldoReaplicado / 10;

    const agrup = {}; // chave: 'YYYY/MM' OU 'YYYY/MM/DD' (seu padrão)
    const seteDiasAtras = new Date(dataMaisRecente);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
    const contagemUltimos7Dias = {};

    // ---------- Mapa diário para janela dos 4 meses ----------
    // daily['YYYY-MM-DD'] = { saldoDia }
    const daily = {};

    for (const bilhete of bilhetes) {
        if (bilhete?.status_bilhete == null) continue;

        const odd = parseFloat(bilhete.odd);
        const valor = Number(bilhete.valor_aposta) || 0;
        if (!isFinite(odd) || !isFinite(valor)) continue;

        apostaReaplicada = saldoReaplicado / 10;
        const ganhoOuPerda = bilhete.status_bilhete ? ((odd - 1) * valor) : (-valor);

        acumuladoGlobal += ganhoOuPerda;

        const d = new Date(bilhete.data);
        if (isNaN(d)) continue;

        // --- seu agrupamento existente (mantém as 5 séries) ---
        const dataFmt = d.toISOString().slice(0, 10).replace(/-/g, '/'); // YYYY/MM/DD
        const chaveAgr = bilhetes.length > 90 ? dataFmt.slice(0, 7) : dataFmt;

        if (!agrup[chaveAgr]) {
            agrup[chaveAgr] = {
                saldoFixo: 0,
                saldoReaplicado: 0,
                num_apostas: 0,
                saldoFixoAcumulado: 0,
                bilhetes_ganhos: 0,
                bilhetes_perdidos: 0
            };
        }
        agrup[chaveAgr].saldoFixo += ganhoOuPerda;
        agrup[chaveAgr].saldoReaplicado += bilhete.status_bilhete ? apostaReaplicada * (odd - 1) : -apostaReaplicada;
        agrup[chaveAgr].num_apostas += 1;
        agrup[chaveAgr].bilhetes_ganhos += bilhete.status_bilhete ? 1 : 0;
        agrup[chaveAgr].bilhetes_perdidos += bilhete.status_bilhete ? 0 : 1;

        // --- últimos 7 dias ---
        if (d >= seteDiasAtras && d <= dataMaisRecente) {
            const dm = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); // dd/mm
            contagemUltimos7Dias[dm] = (contagemUltimos7Dias[dm] || 0) + ganhoOuPerda;
        }

        // --- janela 4 meses para acumulado mensal dia a dia ---
        if (d >= inicioJanela && d <= dataMaisRecente) {
            const key = toISO(d);
            if (!daily[key]) daily[key] = { saldoDia: 0 };
            daily[key].saldoDia += ganhoOuPerda;
        }
    }

    // acumulado do agrupamento existente
    let tmp = 0;
    Object.keys(agrup).sort().forEach(k => {
        tmp += agrup[k].saldoFixo;
        agrup[k].saldoFixoAcumulado = tmp;
    });

    // ---------- Saída ----------
    const chartData = {
        SaldoAcumulado: [],
        SaldoFixo: [],
        BilhetesGanhos: [],
        BilhetesPerdidos: [],
        NumApostas: [],
        SaldoUltimos7Dias: [],
        SaldoAcumulado4Meses: {} // { "Outubro": [ {label, iso, value}, ... ], ... }
    };

    // 5 séries tradicionais
    Object.keys(agrup).forEach(k => {
        chartData.SaldoAcumulado.push({ label: k, value: agrup[k].saldoFixoAcumulado.toFixed(2) });
        chartData.SaldoFixo.push({ label: k, value: agrup[k].saldoFixo.toFixed(2) });
        chartData.BilhetesGanhos.push({ label: k, value: agrup[k].bilhetes_ganhos });
        chartData.BilhetesPerdidos.push({ label: k, value: agrup[k].bilhetes_perdidos });
        chartData.NumApostas.push({ label: k, value: agrup[k].num_apostas });
    });
    Object.entries(contagemUltimos7Dias).forEach(([label, value]) => {
        chartData.SaldoUltimos7Dias.push({ label, value: value.toFixed(2).toString() });
    });

    // ---------- Monta SaldoAcumulado4Meses (nome do mês -> array de pontos) ----------
    // Caminha mês a mês (4 meses), acumulando do 1º dia COM aposta (ou 1º dia do mês se já houver aposta nele).
    let cursorMes = new Date(inicioJanela);
    while (cursorMes <= dataMaisRecente) {
        const mesInicio = startOfMonth(cursorMes);
        const mesFimNatural = endOfMonth(cursorMes);
        const limiteMes = (mesInicio.getMonth() === dataMaisRecente.getMonth() &&
            mesInicio.getFullYear() === dataMaisRecente.getFullYear())
            ? dataMaisRecente // mês atual -> para no dia mais recente
            : mesFimNatural;  // meses anteriores -> até o fim do mês

        const chavesMes = Object.keys(daily).filter(k => {
            const dK = new Date(k);
            return dK >= mesInicio && dK <= limiteMes;
        }).sort();

        const nomeMes = nomeMesPT(mesInicio.getMonth() + 1);
        const pontos = [];
        if (chavesMes.length > 0) {
            // início: 1º dia do mês OU primeiro dia com aposta (o mais “tarde”)
            let inicioSerie = new Date(mesInicio);
            const primeiroComAposta = new Date(chavesMes[0]);
            if (primeiroComAposta > inicioSerie) inicioSerie = primeiroComAposta;

            let cursorDia = new Date(inicioSerie);
            let acumuladoMes = 0;
            while (cursorDia <= limiteMes) {
                const key = toISO(cursorDia);
                const saldoDia = daily[key]?.saldoDia || 0;
                acumuladoMes += saldoDia;

                pontos.push({
                    label: cursorDia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), // dd/mm
                    iso: key,
                    value: acumuladoMes.toFixed(2)
                });

                cursorDia.setDate(cursorDia.getDate() + 1);
            }
        }
        // caso sem apostas no mês: mantém array vazio
        chartData.SaldoAcumulado4Meses[nomeMes] = pontos;

        // próximo mês
        cursorMes = addMonths(cursorMes, 1);
    }

    // ---------- Ordenações ----------
    const sortByDatePT = (a, b) =>
        new Date(a.label.split('/').reverse().join('/')) - new Date(b.label.split('/').reverse().join('/'));
    chartData.SaldoAcumulado.sort(sortByDatePT);
    chartData.SaldoFixo.sort(sortByDatePT);
    chartData.BilhetesGanhos.sort(sortByDatePT);
    chartData.BilhetesPerdidos.sort(sortByDatePT);
    chartData.NumApostas.sort(sortByDatePT);
    chartData.SaldoUltimos7Dias.sort(sortByDatePT);

    return chartData;
};
