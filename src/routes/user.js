const { Router } = require('express');
const AuthController = require('../controllers/authController.js');
const UserController = require('../controllers/UserController');
const authController = new AuthController();
const userController = new UserController();

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = Router();

router.post('/user/register', async (req, res) => authController.register(req, res));
router.post('/user/login', async (req, res) => authController.login(req, res));
router.post('/user/logout', async (req, res) => authController.logout(req, res));
router.post('/user/refresh', async (req, res) => authController.refresh(req, res));
router.post('/user/role', auth, authorize(['admin']), (req, res) => userController.createRole(req, res));
router.post('/user/permission', auth, authorize(['admin']), (req, res) => userController.createPermission(req, res));
router.post('/user/role/:roleId/permissions', auth, authorize(['admin']), (req, res) => userController.attachPermissionsToRole(req, res));
router.post('/user/:userId/roles', auth, authorize(['admin']), (req, res) => userController.attachRolesToUser(req, res));


module.exports = router;