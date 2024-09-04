module.exports = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000); // 1 hora = 3600000 milissegundos
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millis = milliseconds % 1000;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(Math.floor(millis / 10)).padStart(2, '0')}`;
}
