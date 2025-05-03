const Queue = require('bull');
const redisConfig = require('../config/radis');

const jobs = require('../jobs/'); // O index.js na pasta já será carregado automaticamente
console.log('jobs', jobs)

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, redisConfig),
  name: job.key,
  handle: job.handle,
  options: job.options,
}));

module.exports = {
  queues,
  add(name, data) {
    const queue = this.queues.find(queue => queue.name === name);
    return queue.bull.add(data, queue.options);
  },
  process() {
    this.queues.forEach(queue => {
      queue.bull.process(queue.handle);

      queue.bull.on('failed', (job, err) => {
        console.log('Job failed', queue.name, job.data); // Corrigido queue.key → queue.name
        console.log(err);
      });
    });
  }
};
