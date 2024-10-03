const express = require('express');
const profileRouter = express.Router();

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

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    // This checks if the request data passes the validation defined in validateEditProfileData.
    if (!validateEditProfileData(req)) {
      throw new Error('Invalid Edit Request');
      // retrun res.status(400).send('');
    }

    // user attached to request from userAuth
    const loggedInUser = req.user;

    // This iterates over the keys in the request body and updates the corresponding properties of the loggedInUser object. This effectively modifies the user profile data.
    // modifying the loggedInUser object directly, so there's no need to create a new array of modified users.
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

module.exports = profileRouter;
