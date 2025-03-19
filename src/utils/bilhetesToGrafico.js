module.exports = (bilhetes) => {
    let saldoFixoAcumulado = 0; // Saldo inicial para aposta fixa
    let saldoReaplicado = 10; // Saldo inicial para aposta reaplicada
    let apostaReaplicada = saldoReaplicado / 10; // Aposta inicial reaplicada
    const meuGrafico = {};
    
    for (let bilhete of bilhetes) {
        const odd = parseFloat(bilhete.odd);
        apostaReaplicada = saldoReaplicado / 10;
        
        const ganhoOuPerda = bilhete.status_bilhete ? (odd - 1) : -1;
        saldoFixoAcumulado += ganhoOuPerda;
        
        const dataFormatada = new Date(bilhete.data).toISOString().slice(0, 10).replace(/-/g, '/');
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
    }
    
    // Atualiza o saldo acumulado corretamente
    let saldoAcumuladoTemp = 0;
    Object.keys(meuGrafico).sort().forEach((data, index, arr) => {
        saldoAcumuladoTemp += meuGrafico[data].saldoFixo;
        meuGrafico[data].saldoFixoAcumulado = saldoAcumuladoTemp;
    });
    
    // Transformação dos dados para o gráfico
    const chartData = {
        SaldoAcumulado: [],
        SaldoFixo: [],
        BilhetesGanhos: [],
        BilhetesPerdidos: [],
        NumApostas: []
    };
    
    Object.keys(meuGrafico).forEach((data) => {
        chartData.SaldoAcumulado.push({ label: data, value: meuGrafico[data].saldoFixoAcumulado.toFixed(2) });
        chartData.SaldoFixo.push({ label: data, value: meuGrafico[data].saldoFixo.toFixed(2) });
        chartData.BilhetesGanhos.push({ label: data, value: meuGrafico[data].bilhetes_ganhos });
        chartData.BilhetesPerdidos.push({ label: data, value: meuGrafico[data].bilhetes_perdidos });
        chartData.NumApostas.push({ label: data, value: meuGrafico[data].num_apostas });
    });
    
    return chartData;
};
