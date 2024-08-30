module.exports = (dateString) => {
    const createdAt = new Date(dateString);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Zera a parte de tempo da data atual

    const createdAtDateOnly = new Date(createdAt);
    createdAtDateOnly.setHours(0, 0, 0, 0);  // Zera a parte de tempo de createdAt

    // Comparando as datas (ano, mês e dia)
    return createdAtDateOnly.getTime() === today.getTime()
}