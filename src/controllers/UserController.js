'use strict';
const { z } = require('zod');
const { sequelize, User, Role, Permission } = require('../database/models');

function problem(res, status, code, message, details) {
    return res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

const roleSchema = z.object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(255).optional().default('')
}).strict();

const permissionSchema = z.object({
    key: z.string().trim().min(2).max(100),
    description: z.string().trim().max(255).optional().default(''),
    // vínculo opcional imediato:
    roleId: z.number().int().positive().optional(),
    roleName: z.string().trim().min(2).max(50).optional()
}).strict();

const attachPermsSchema = z.object({
    // aceita um ou mais ids/keys
    permissionIds: z.array(z.number().int().positive()).optional().default([]),
    permissionKeys: z.array(z.string().trim().min(1)).optional().default([]),
}).strict();

const attachRolesToUserSchema = z.object({
    roleIds: z.array(z.number().int().positive()).optional().default([]),
    roleNames: z.array(z.string().trim().min(1)).optional().default([]),
}).strict();

class UserController {
    // POST /role
    async createRole(req, res) {
        const parsed = roleSchema.safeParse(req.body);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', details);
        }
        const { name, description } = parsed.data;

        try {
            const [role, created] = await Role.findOrCreate({
                where: { name },
                defaults: { name, description }
            });
            if (!created) return res.status(200).json({ message: 'Role já existia', role });
            return res.status(201).json({ role });
        } catch (err) {
            const code = err?.original?.code;
            if (code === '23505') return problem(res, 409, 'ROLE_DUPLICATE', 'Role já cadastrada.');
            return problem(res, 500, 'ROLE_CREATE_FAILED', 'Falha ao criar role.');
        }
    }

    // POST /permission
    // Cria permission e, se vier roleId/roleName, já vincula à role
    async createPermission(req, res) {
        const parsed = permissionSchema.safeParse(req.body);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', details);
        }
        const { key, description, roleId, roleName } = parsed.data;

        const t = await sequelize.transaction();
        try {
            const [perm] = await Permission.findOrCreate({
                where: { key },
                defaults: { key, description },
                transaction: t
            });

            // vínculo opcional
            if (roleId || roleName) {
                const role = roleId
                    ? await Role.findByPk(roleId, { transaction: t })
                    : await Role.findOne({ where: { name: roleName }, transaction: t });

                if (!role) {
                    await t.rollback();
                    return problem(res, 404, 'ROLE_NOT_FOUND', 'Role informada não encontrada.');
                }

                // evita duplicar no N:N
                await role.addPermission(perm, { transaction: t });
            }

            await t.commit();
            return res.status(201).json({ permission: { id: perm.id, key: perm.key, description: perm.description } });
        } catch (err) {
            await t.rollback();
            const code = err?.original?.code;
            if (code === '23505') return problem(res, 409, 'PERMISSION_DUPLICATE', 'Permission já cadastrada.');
            return problem(res, 500, 'PERMISSION_CREATE_FAILED', 'Falha ao criar permission.');
        }
    }

    // POST /role/:roleId/permissions
    // Vincula uma ou mais permissions (por id e/ou por key) a uma role
    async attachPermissionsToRole(req, res) {
        const roleId = Number(req.params.roleId);
        if (!Number.isInteger(roleId) || roleId <= 0) {
            return problem(res, 400, 'INVALID_ROLE_ID', 'Parâmetro roleId inválido.');
        }
        const parsed = attachPermsSchema.safeParse(req.body);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', details);
        }
        const { permissionIds, permissionKeys } = parsed.data;

        if (permissionIds.length === 0 && permissionKeys.length === 0) {
            return problem(res, 400, 'EMPTY_PERMISSIONS', 'Informe permissionIds ou permissionKeys.');
        }

        const t = await sequelize.transaction();
        try {
            const role = await Role.findByPk(roleId, { transaction: t });
            if (!role) {
                await t.rollback();
                return problem(res, 404, 'ROLE_NOT_FOUND', 'Role não encontrada.');
            }

            const permsById = permissionIds.length
                ? await Permission.findAll({ where: { id: permissionIds }, transaction: t })
                : [];
            const permsByKey = permissionKeys.length
                ? await Permission.findAll({ where: { key: permissionKeys }, transaction: t })
                : [];

            const allPerms = [...permsById, ...permsByKey];
            if (allPerms.length === 0) {
                await t.rollback();
                return problem(res, 404, 'PERMISSIONS_NOT_FOUND', 'Nenhuma permission encontrada para vincular.');
            }

            await role.addPermissions(allPerms, { transaction: t });
            await t.commit();

            return res.status(200).json({
                role: { id: role.id, name: role.name },
                addedPermissions: allPerms.map(p => ({ id: p.id, key: p.key }))
            });
        } catch (err) {
            await t.rollback();
            return problem(res, 500, 'ATTACH_PERMISSIONS_FAILED', 'Falha ao vincular permissions na role.');
        }
    }

    // (bônus) POST /user/:userId/roles — vincula role(s) a um usuário
    async attachRolesToUser(req, res) {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return problem(res, 400, 'INVALID_USER_ID', 'Parâmetro userId inválido.');
        }
        const parsed = attachRolesToUserSchema.safeParse(req.body);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
            return problem(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.', details);
        }
        const { roleIds, roleNames } = parsed.data;
        if (roleIds.length === 0 && roleNames.length === 0) {
            return problem(res, 400, 'EMPTY_ROLES', 'Informe roleIds ou roleNames.');
        }

        const t = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction: t });
            if (!user) {
                await t.rollback();
                return problem(res, 404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
            }

            const rolesById = roleIds.length
                ? await Role.findAll({ where: { id: roleIds }, transaction: t })
                : [];
            const rolesByName = roleNames.length
                ? await Role.findAll({ where: { name: roleNames }, transaction: t })
                : [];

            const allRoles = [...rolesById, ...rolesByName];
            if (allRoles.length === 0) {
                await t.rollback();
                return problem(res, 404, 'ROLES_NOT_FOUND', 'Nenhuma role encontrada para vincular.');
            }

            await user.addRoles(allRoles, { transaction: t });
            await t.commit();

            return res.status(200).json({
                user: { id: user.id, name: user.name, email: user.email },
                addedRoles: allRoles.map(r => ({ id: r.id, name: r.name }))
            });
        } catch (err) {
            await t.rollback();
            return problem(res, 500, 'ATTACH_ROLES_FAILED', 'Falha ao vincular roles ao usuário.');
        }
    }
}

module.exports = UserController;
