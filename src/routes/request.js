const express = require('express');
const requestRouter = express.Router();

// for checking authorized or not
const { userAuth } = require('../middlewares/auth');

module.exports = requestRouter;
