
const Queue = require('./lib/Queue');

(async () => {
  await Queue.add('enviaMensagemTelegram', {
    message: 'TTTTT',
  });
})();
