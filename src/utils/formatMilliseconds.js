module.exports = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millis = milliseconds % 1000;
    return `${minutes}:${String(seconds).padStart(2, '0')}:${String(Math.floor(millis / 10)).padStart(2, '0')}`;
}