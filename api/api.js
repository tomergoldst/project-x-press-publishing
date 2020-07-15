const app = require("../server");

const express = require('express');
const router = express.Router();
const artistsRouter = require('./artists');
const seriesRouter = require('./series');

router.use('/artists', artistsRouter);
router.use('/series', seriesRouter);

module.exports = router;


