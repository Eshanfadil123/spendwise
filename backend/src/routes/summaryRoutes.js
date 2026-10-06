const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/summaryController');
const auth = require('../middleware/auth');

router.get('/', auth, getSummary);

module.exports = router;
