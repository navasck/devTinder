const express = require('express');
// Import necessary modules
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const profileRouter = express.Router();

// for checking authorized or not
const { userAuth } = require('../middlewares/auth');
const {
  validateEditProfileData,
  validateResetPasswordData,
} = require('../utils/validation');

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

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
  try {
    // Validate the request data
    if (!validateResetPasswordData(req)) {
      throw new Error('Invalid Reset Password Request');
    }

    const { oldPassword, newPassword } = req.body;

    // Get the logged-in user
    const user = req.user;

    // Verify the old password
    const isPasswordValid = await user.validatePassword(oldPassword);

    if (!isPasswordValid) {
      throw new Error('Invalid old password');
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

module.exports = profileRouter;
