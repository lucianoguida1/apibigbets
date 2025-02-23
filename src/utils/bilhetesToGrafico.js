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
        } else {
            meuGrafico[data] = {
                saldoFixo: (bilhete.status_bilhete ? 1 * (odd - 1) : -1),
                saldoReaplicado: (bilhete.status_bilhete ? apostaReaplicada * (odd - 1) : -apostaReaplicada),
                num_apostas: 1,
                saldoFixoAcumulado: saldoFixoAcumulado,
            };
        }
    };


    // Transformação dos dados para o gráfico
    const labels = Object.keys(meuGrafico); // Datas no eixo X
    const saldosFixos = Object.values(meuGrafico).map((entry) => entry.saldoFixo.toFixed(2)); // Saldos da aposta fixa
    const saldosReaplicados = Object.values(meuGrafico).map((entry) => entry.saldoFixoAcumulado.toFixed(2)); // Saldos da aposta reaplicada

    const dadosGrafico = {
        saldo_dia_dia: meuGrafico,
        labels,
        saldosFixos,
        saldoFixoAcumulado: saldosReaplicados,
    };
    return dadosGrafico;
}