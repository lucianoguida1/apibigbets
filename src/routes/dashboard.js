const { Router } = require('express');
const DashboardController = require('../controllers/DashboardController.js');
const dashboardController = new DashboardController();

const router = Router();

router.get('/dashboard/lucroontem', async (req, res) => dashboardController.lucroOntem(req, res));


module.exports = router;