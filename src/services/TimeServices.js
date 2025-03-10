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
                    ),times_id AS (
                        SELECT time_id from (
                            select casa_id as time_id from todos_jogos
                            union all
                            select fora_id as time_id from todos_jogos
                        )t1 group by time_id having count(*) >= 10
                    )
                    SELECT TIME.* FROM TIMES TIME
                    INNER JOIN times_id T on T.time_id = TIME.id
                    ORDER BY TIME.nome ASC`;

        const teams = await sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT,
        });


        return teams;
    }
}

module.exports = TimeServices;