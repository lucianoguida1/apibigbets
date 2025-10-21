// middleware/permissions.js
// supondo que você injete permissions no token no login (ou carregue do DB aqui)
module.exports = function requirePermissions(perms = []) {
    return (req, res, next) => {
        const userPerms = req.user?.permissions || [];
        const ok = perms.every(p => userPerms.includes(p));
        return ok ? next() : res.status(403).json({ error: 'Permissão insuficiente' });
    };
};
