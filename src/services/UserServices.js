const Services = require('./Services.js');
const { User, Role, sequelize } = require('../database/models');

class UserServices extends Services {
    constructor() {
        super('User');
    }

    async pegaUmUsuario(conditions = {}) {
        return User.findOne({
            ...conditions,
            include: [Role],
        });
    }
}

module.exports = UserServices;