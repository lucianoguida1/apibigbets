const fs = require('fs');
const path = require('path');

const jobs = {};

fs.readdirSync(__dirname).forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (
        file !== 'index.js' &&
        file.endsWith('.js')
    ) {
        const jobName = path.basename(file, '.js');
        jobs[jobName] = require(filePath);
    }
});

module.exports = jobs;
