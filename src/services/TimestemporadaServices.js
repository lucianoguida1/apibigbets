const Services = require('./Services.js');

class TimestemporadaServices extends Services {
    constructor() {
        super('Timestemporada');
    }

    async pegaTimeNaTemporada(jogo) {
        const times = [jogo.casa_id, jogo.fora_id];

        // Busca todos os registros dos times na temporada de uma vez
        const timesExistentes = await super.pegaTodosOsRegistros({
            where: {
                time_id: times,
                temporada_id: jogo.temporada_id
            }
        });

        // Mapeia os IDs dos times já encontrados
        const idsExistentes = timesExistentes.map(time => time.time_id);

        // Filtra os times que precisam ser criados
        const idsFaltando = times.filter(timeId => !idsExistentes.includes(timeId));

        // Cria os registros para os times faltando
        const novosTimes = await Promise.all(
            idsFaltando.map(timeId =>
                super.criaRegistro({ time_id: timeId, temporada_id: jogo.temporada_id })
            )
        );

        // Retorna todos os registros (existentes e novos)
        return [...timesExistentes, ...novosTimes];
    }

}

module.exports = TimestemporadaServices;