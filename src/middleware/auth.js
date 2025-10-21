// middleware/auth.js
const { verifyAccessToken } = require('../utils/jwt');
const UserServices = require('../services/UserServices.js');
const User = new UserServices();

module.exports = async function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    try {
        const payload = verifyAccessToken(token);
        // checa se o usuário não trocou a senha depois que o token foi emitido
        const user = await User.findByPk(payload.sub);
        const pcaServer = user?.password_changed_at?.getTime() || 0;
        if (payload.pca !== pcaServer) return res.status(401).json({ error: 'Token inválido' });

        req.user = { id: payload.sub, roles: payload.roles || [] };
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token inválido/expirado' });
    }
};
