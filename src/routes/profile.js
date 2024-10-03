const express = require('express');
const authRouter = express.Router();

// for checking authorized or not
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    // this is setting from "userAuth middleware"
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

module.exports = profileRouter;
