// utils/jwt.js
const jwt = require('jsonwebtoken');
const ACCESS_TTL = '15m'; // curto
const REFRESH_TTL_DAYS = 30;

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
module.exports = { signAccessToken, verifyAccessToken, REFRESH_TTL_DAYS };
