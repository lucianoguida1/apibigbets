module.exports = (somaDias = 0) => {
    const now = new Date();
    now.setDate(now.getDate() + somaDias);  // Soma o número de dias à data atual

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês é baseado em zero, então adicionamos 1
    const day = String(now.getDate()).padStart(2, '0');

    const data = `${year}-${month}-${day}`;
    return data;
};