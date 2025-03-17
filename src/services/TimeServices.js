const Services = require('./Services.js');
const { Time, Jogo, sequelize } = require('../database/models');

class TimeServices extends Services {
    constructor() {
        super('Time');
    }

    async pegaTime(time) {
        let team = await super.pegaUmRegistro({ where: { 'id_sports': time.id } });
        if (team === null) {
            team = super.criaRegistro({
                'nome': time.name,
                'logo': time.logo,
                'id_sports': time.id,
            });
        }
        return team;
    }

    async pegaPrincipaisTimes() {

        const sql = `WITH todos_jogos AS (
                        SELECT * FROM JOGOS
                    ), times_id AS (
                        SELECT time_id, COUNT(*) num_jogos 
                        FROM (
                            SELECT casa_id AS time_id FROM todos_jogos
                            UNION ALL
                            SELECT fora_id AS time_id FROM todos_jogos
                        ) t1 
                        GROUP BY time_id
                    )
                    SELECT num_jogos, TIME.* 
                    FROM TIMES TIME
                    INNER JOIN times_id T ON T.time_id = TIME.id
                    ORDER BY num_jogos DESC
                    LIMIT 100;
                    `;
        const teams = await sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT,
        });

        return teams;
    }
}

module.exports = TimeServices;