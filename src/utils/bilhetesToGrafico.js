module.exports = (bilhetes) => {

    let saldoFixoAcumulado = 0; // Saldo inicial para aposta fixa
    let saldoReaplicado = 10; // Saldo inicial para aposta reaplicada
    let apostaReaplicada = saldoReaplicado / 10; // Aposta inicial reaplicada
    const meuGrafico = [];

    // Itera sobre os grupos para calcular os saldos fixos e reaplicados
    for (let bilhete of bilhetes) {
        const odd = parseFloat(bilhete.odd);

        // Atualiza a aposta reaplicada para o próximo bilhete
        apostaReaplicada = saldoReaplicado / 10;
        saldoFixoAcumulado += bilhete.status_bilhete ? 1 * (odd - 1) : -1;
        
        const dataFormatada = new Date(bilhete.data).toISOString().slice(0, 10).replace(/-/g, '/');
        
        const data = bilhetes.length > 90 ? dataFormatada.slice(0, 7) : dataFormatada;
        
        if (meuGrafico[data]) {
            meuGrafico[data].saldoFixo += bilhete.status_bilhete ? 1 * (odd - 1) : -1;
            meuGrafico[data].saldoReaplicado += bilhete.status_bilhete ? apostaReaplicada * (odd - 1) : -apostaReaplicada;
            meuGrafico[data].num_apostas += 1;
            meuGrafico[data].saldoFixoAcumulado = saldoFixoAcumulado;
            meuGrafico[data].bilhetes_ganhos += bilhete.status_bilhete ? 1 : 0;
            meuGrafico[data].bilhetes_perdidos += bilhete.status_bilhete ? 0 : 1;
        } else {
            meuGrafico[data] = {
                saldoFixo: (bilhete.status_bilhete ? 1 * (odd - 1) : -1),
                saldoReaplicado: (bilhete.status_bilhete ? apostaReaplicada * (odd - 1) : -apostaReaplicada),
                num_apostas: 1,
                saldoFixoAcumulado: saldoFixoAcumulado,
                bilhetes_ganhos: bilhete.status_bilhete ? 1 : 0,
                bilhetes_perdidos: bilhete.status_bilhete ? 0 : 1,
            };
        }
    };

    // Transformação dos dados para o gráfico
    const chartData = {};
    chartData['SaldoAcumulado'] = Object.keys(meuGrafico).map((data) => ({
        label: data,
        value: meuGrafico[data].saldoFixoAcumulado.toFixed(2)
    }));
    chartData['SaldoFixo'] = Object.keys(meuGrafico).map((data) => ({
        label: data,
        value: meuGrafico[data].saldoFixo.toFixed(2)
    }));
    chartData['BilhetesGanhos'] = Object.keys(meuGrafico).map((data) => ({
        label: data,
        value: meuGrafico[data].bilhetes_ganhos
    }));
    chartData['BilhetesPerdidos'] = Object.keys(meuGrafico).map((data) => ({
        label: data,
        value: meuGrafico[data].bilhetes_perdidos
    }));
    chartData['NumApostas'] = Object.keys(meuGrafico).map((data) => ({
        label: data,
        value: meuGrafico[data].num_apostas
    }));
    return chartData;
}