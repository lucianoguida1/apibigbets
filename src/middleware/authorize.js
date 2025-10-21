// middleware/authorize.js
module.exports = function authorize(requiredRoles = []) {
    return (req, res, next) => {
        const roles = req.user?.roles || [];
        const ok = requiredRoles.length === 0 || requiredRoles.some(r => roles.includes(r));
        return ok ? next() : res.status(403).json({ error: 'Acesso negado' });
    };
};
