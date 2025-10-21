const Controller = require('./Controller.js');
const UserServices = require('../services/UserServices.js');
const RoleServices = require('../services/RoleServices.js');
const RefreshToken = require('../services/RefreshTokenServices.js');

const { signAccessToken, REFRESH_TTL_DAYS } = require('../utils/jwt.js');

const { sequelize } = require('../database/models');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const User = new UserServices();
const Role = new RoleServices();
const refToken = new RefreshToken();
const crypto = require('crypto');
const ms = require('ms');


function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

// === Schema Zod ===
const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, 'Nome muito curto')
        .max(100, 'Nome muito longo'),
    email: z.string()
        .trim()
        .toLowerCase()
        .email('E-mail inválido'),
    password: z.string()
        .min(8, 'Senha deve ter ao menos 8 caracteres')
        .max(128, 'Senha muito longa')
        .refine(v => /[A-Z]/.test(v), 'Senha precisa ter ao menos 1 letra maiúscula')
        .refine(v => /[a-z]/.test(v), 'Senha precisa ter ao menos 1 letra minúscula')
        .refine(v => /[0-9]/.test(v), 'Senha precisa ter ao menos 1 número')
        .refine(v => /[^A-Za-z0-9]/.test(v), 'Senha precisa ter ao menos 1 símbolo'),
}).strict(); // rejeita campos desconhecidos

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
}).strict();

function problem(res, status, code, message, details) {
    return res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

function zodErrorToDetails(err) {
    return err.issues?.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
    })) || [];
}


class AuthController extends Controller {
    async register(req, res) {
        // 1) Validação com Zod
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', zodErrorToDetails(parsed.error));
        }
        const { name, email, password } = parsed.data;

        // 2) Checagem rápida (e trataremos também a constraint no DB)
        try {
            const exists = await (User.pegaUmRegistro?.({ where: { email } }) || User.pegaUmRegistro({ where: { email } }));
            if (exists) return problem(res, 409, 'EMAIL_IN_USE', 'Email já cadastrado.');
        } catch (err) {
            return problem(res, 500, 'READ_FAILED', 'Falha ao verificar e-mail.');
        }

        // 3) Hash
        const password_hash = await bcrypt.hash(password, 12);

        // 4) Transação: cria usuário + vincula role padrão
        const t = await sequelize.transaction();
        try {
            const user = await User.criaRegistro({
                name,
                email,
                password_hash,
                is_active: true,
                password_changed_at: new Date(),
            }, { transaction: t });

            const role = await (Role.pegaUmRegistro?.({ where: { name: 'user' } }) || Role.pegaUmRegistro({ where: { name: 'user' } }));
            if (!role) {
                throw Object.assign(new Error('Role padrão "user" não encontrada'), { code: 'ROLE_MISSING' });
            }

            await user.addRole(role, { transaction: t });
            await t.commit();

            return res.status(201).json({ id: user.id, name: user.name, email: user.email });

        } catch (err) {
            await t.rollback();

            const name = err?.name || '';
            const pgCode = err?.original?.code;
            // UniqueConstraintError (Sequelize) ou 23505 (Postgres)
            if (name === 'SequelizeUniqueConstraintError' || pgCode === '23505') {
                return problem(res, 409, 'EMAIL_IN_USE', 'Email já cadastrado.');
            }
            if (err.code === 'ROLE_MISSING') {
                return problem(res, 500, 'ROLE_NOT_FOUND', 'Role padrão "user" não está configurada.');
            }
            return problem(res, 500, 'REGISTER_FAILED', 'Falha ao registrar usuário.');
        }
    }

    async login(req, res) {
        // 1) Validação do payload
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', details);
        }
        const { email, password } = parsed.data;

        let user;
        try {
            // 2) Busca do usuário (com roles já incluídas, se possível)
            user = await (User.pegaUmUsuario?.({ where: { email } }) ||
                User.pegaUmUsuario({ where: { email } }));
        } catch (err) {
            return problem(res, 500, 'READ_FAILED', 'Falha ao consultar usuário.');
        }

        // 3) Credenciais e status
        if (!user) {
            return problem(res, 401, 'INVALID_CREDENTIALS', 'Credenciais inválidas.');
        }
        if (user.is_active === false) {
            return problem(res, 423, 'USER_LOCKED', 'Usuário inativo/bloqueado.');
        }

        try {
            const ok = await bcrypt.compare(password, user.password_hash);
            if (!ok) {
                return problem(res, 401, 'INVALID_CREDENTIALS', 'Credenciais inválidas.');
            }
        } catch (err) {
            return problem(res, 500, 'HASH_COMPARE_FAILED', 'Falha ao validar credenciais.');
        }

        // 4) Monta roles de forma resiliente (via include ou via getRoles)
        let roles = [];
        try {
            if (Array.isArray(user.Roles) || Array.isArray(user.roles)) {
                const arr = user.Roles || user.roles || [];
                roles = arr.map(r => r.name);
            } else if (typeof user.getRoles === 'function') {
                roles = (await user.getRoles()).map(r => r.name);
            }
        } catch (err) {
            return problem(res, 500, 'ROLES_LOAD_FAILED', 'Falha ao carregar permissões.');
        }

        // 5) Emite tokens
        let accessToken, refreshToken, tokenHash, family_id, expiresAt;
        try {
            accessToken = signAccessToken({
                sub: user.id,
                roles,
                pca: user.password_changed_at?.getTime() || 0,
            });

            refreshToken = crypto.randomBytes(64).toString('base64url');
            tokenHash = sha256(refreshToken);
            family_id = crypto.randomUUID();
            expiresAt = new Date(Date.now() + ms(`${REFRESH_TTL_DAYS}d`));
        } catch (err) {
            console.log("err ==> ", err);
            return problem(res, 500, 'TOKEN_CREATE_FAILED', 'Falha ao criar tokens.');
        }

        // 6) Persiste refresh token e seta cookie
        try {
            await refToken.criaRegistro({
                user_id: user.id,
                token_hash: tokenHash,
                family_id,
                expires_at: expiresAt,
                created_by_ip: req.ip,
            });

            res.cookie('rt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/auth/refresh',
                maxAge: ms(`${REFRESH_TTL_DAYS}d`),
            });
        } catch (err) {
            console.log("err ==> ", err);
            return problem(res, 500, 'REFRESH_PERSIST_FAILED', 'Falha ao salvar sessão (refresh token).');
        }

        // 7) OK
        return res.json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email, roles },
        });
    };

    async refresh(req, res) {
        // 1) Precisa do cookie httpOnly "rt"
        const rt = req.cookies?.rt;
        if (!rt) return problem(res, 401, 'NO_REFRESH', 'Sem refresh token.');

        // 2) Localiza o token salvo (hash)
        const oldHash = sha256(rt);
        let saved;
        try {
            saved = await (refToken.pegaUmRegistro?.({ where: { token_hash: oldHash } }) ||
                refToken.findOne({ where: { token_hash: oldHash } }));
        } catch (err) {
            return problem(res, 500, 'READ_FAILED', 'Falha ao consultar sessão.');
        }

        // 3) Checagens básicas (expirado/inválido)
        const now = new Date();
        if (!saved) {
            // token não existe mais → provavelmente reutilizado/velho
            // (não sabemos a família, então apenas limpa cookie)
            res.clearCookie('rt', { path: '/auth/refresh' });
            return problem(res, 401, 'INVALID_REFRESH', 'Refresh inválido.');
        }

        // 3.1 Reuso detectado: token já revogado ou já trocado por outro
        const wasReused = saved.is_revoked || !!saved.replaced_by_token_hash;
        const isExpired = saved.expires_at < now;

        if (wasReused || isExpired) {
            try {
                // Revoga toda a família por segurança (session hijack mitigation)
                await refToken.update(
                    { is_revoked: true },
                    { where: { family_id: saved.family_id } }
                );
            } catch (err) {
                // segue mesmo assim
            }
            res.clearCookie('rt', { path: '/auth/refresh' });
            return problem(res, 401, 'INVALID_REFRESH', 'Refresh inválido.');
        }

        // 4) Carrega usuário e roles
        let user, roles = [];
        try {
            user = await User.findByPk(saved.user_id, { include: [Role] });
            if (!user || user.is_active === false) {
                // revoga família e encerra
                await refToken.update(
                    { is_revoked: true },
                    { where: { family_id: saved.family_id } }
                );
                res.clearCookie('rt', { path: '/auth/refresh' });
                return problem(res, 401, 'USER_INACTIVE', 'Sessão inválida para este usuário.');
            }
            // roles via include ou getRoles
            const arr = (user.Roles || user.roles || []);
            roles = arr.length ? arr.map(r => r.name) : (await user.getRoles()).map(r => r.name);
        } catch (err) {
            return problem(res, 500, 'USER_LOAD_FAILED', 'Falha ao carregar usuário/permissões.');
        }

        // 5) Emite novo access e novo refresh (rotação)
        let accessToken, newRT, newHash, expiresAt;
        try {
            accessToken = signAccessToken({
                sub: user.id,
                roles,
                pca: user.password_changed_at?.getTime() || 0,
            });
            newRT = crypto.randomBytes(64).toString('base64url');
            newHash = sha256(newRT);
            expiresAt = new Date(Date.now() + ms(`${REFRESH_TTL_DAYS}d`));
        } catch (err) {
            return problem(res, 500, 'TOKEN_CREATE_FAILED', 'Falha ao criar tokens.');
        }

        // 6) Rotação atômica
        try {
            await sequelize.transaction(async (t) => {
                await saved.update(
                    { is_revoked: true, replaced_by_token_hash: newHash },
                    { transaction: t }
                );
                await refToken.create({
                    user_id: user.id,
                    token_hash: newHash,
                    family_id: saved.family_id,
                    expires_at: expiresAt,
                    created_by_ip: req.ip,
                }, { transaction: t });
            });
        } catch (err) {
            return problem(res, 500, 'REFRESH_ROTATE_FAILED', 'Falha ao rotacionar sessão.');
        }

        // 7) Atualiza cookie httpOnly com novo refresh
        try {
            res.cookie('rt', newRT, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/auth/refresh',
                maxAge: ms(`${REFRESH_TTL_DAYS}d`),
            });
        } catch (err) {
            return problem(res, 500, 'COOKIE_SET_FAILED', 'Falha ao atualizar cookie de sessão.');
        }

        // 8) OK
        return res.json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email, roles },
        });
    };

    async logout(req, res) {
        const rt = req.cookies?.rt;
        if (rt) {
            const h = sha256(rt);
            await refToken.atualizaRegistro({ is_revoked: true }, { where: { token_hash: h } });
            res.clearCookie('rt', { path: '/auth/refresh' });
        }
        return res.status(204).send();
    }
}

module.exports = AuthController;
