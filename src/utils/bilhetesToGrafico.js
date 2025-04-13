module.exports = (bilhetes) => {
    let saldoFixoAcumulado = 0;
    let saldoReaplicado = 10;
    let apostaReaplicada = saldoReaplicado / 10;
    const meuGrafico = {};

    // Pega a data mais recente para calcular os últimos 7 dias
    const datasOrdenadas = bilhetes.map(b => new Date(b.data)).sort((a, b) => b - a);
    const dataMaisRecente = datasOrdenadas[0];
    const seteDiasAtras = new Date(dataMaisRecente);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6); // Inclui hoje + 6 dias atrás

    const contagemUltimos7Dias = {};

    for (let bilhete of bilhetes) {
        if (bilhete.status_bilhete == null || bilhete.status_bilhete == undefined) {
            continue; // Ignora bilhetes sem status            
        }
        const odd = parseFloat(bilhete.odd);
        apostaReaplicada = saldoReaplicado / 10;

        const ganhoOuPerda = bilhete.status_bilhete ? (odd - 1) : -1;
        saldoFixoAcumulado += ganhoOuPerda;

        const dataOriginal = new Date(bilhete.data);
        const dataFormatada = dataOriginal.toISOString().slice(0, 10).replace(/-/g, '/');
        const data = bilhetes.length > 90 ? dataFormatada.slice(0, 7) : dataFormatada;

        if (!meuGrafico[data]) {
            meuGrafico[data] = {
                saldoFixo: 0,
                saldoReaplicado: 0,
                num_apostas: 0,
                saldoFixoAcumulado: 0,
                bilhetes_ganhos: 0,
                bilhetes_perdidos: 0,
            };
        }

        meuGrafico[data].saldoFixo += ganhoOuPerda;
        meuGrafico[data].saldoReaplicado += bilhete.status_bilhete ? apostaReaplicada * (odd - 1) : -apostaReaplicada;
        meuGrafico[data].num_apostas += 1;
        meuGrafico[data].bilhetes_ganhos += bilhete.status_bilhete ? 1 : 0;
        meuGrafico[data].bilhetes_perdidos += bilhete.status_bilhete ? 0 : 1;

        // Agrupar os últimos 7 dias
        if (dataOriginal >= seteDiasAtras && dataOriginal <= dataMaisRecente) {
            const diaMes = dataOriginal.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!contagemUltimos7Dias[diaMes]) {
                contagemUltimos7Dias[diaMes] = 0;
            }
            contagemUltimos7Dias[diaMes] += ganhoOuPerda;
        }
    }

    let saldoAcumuladoTemp = 0;
    Object.keys(meuGrafico).sort().forEach((data) => {
        saldoAcumuladoTemp += meuGrafico[data].saldoFixo;
        meuGrafico[data].saldoFixoAcumulado = saldoAcumuladoTemp;
    });

    const chartData = {
        SaldoAcumulado: [],
        SaldoFixo: [],
        BilhetesGanhos: [],
        BilhetesPerdidos: [],
        NumApostas: [],
        SaldoUltimos7Dias: []
    };

    Object.keys(meuGrafico).forEach((data) => {
        chartData.SaldoAcumulado.push({ label: data, value: meuGrafico[data].saldoFixoAcumulado.toFixed(2) });
        chartData.SaldoFixo.push({ label: data, value: meuGrafico[data].saldoFixo.toFixed(2) });
        chartData.BilhetesGanhos.push({ label: data, value: meuGrafico[data].bilhetes_ganhos });
        chartData.BilhetesPerdidos.push({ label: data, value: meuGrafico[data].bilhetes_perdidos });
        chartData.NumApostas.push({ label: data, value: meuGrafico[data].num_apostas });
    });

    // Adiciona os últimos 7 dias
    Object.entries(contagemUltimos7Dias).forEach(([label, value]) => {
        chartData.SaldoUltimos7Dias.push({ label, value: value.toFixed(2).toString() });
    });

    // Ordena os dados por data
    const sortByDate = (a, b) => new Date(a.label.split('/').reverse().join('/')) - new Date(b.label.split('/').reverse().join('/'));
    chartData.SaldoAcumulado.sort(sortByDate);
    chartData.SaldoFixo.sort(sortByDate);
    chartData.BilhetesGanhos.sort(sortByDate);
    chartData.BilhetesPerdidos.sort(sortByDate);
    chartData.NumApostas.sort(sortByDate);
    chartData.SaldoUltimos7Dias.sort(sortByDate);

    return chartData;
};
