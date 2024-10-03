const express = require('express');
const authRouter = express.Router();

const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');
// A library for securely hashing passwords.
const bcrypt = require('bcrypt');

authRouter.post('/signup', async (req, res) => {
  // creating a new instance of the User Model
  // const user = new User(req.body);
  // const user = new User({
  //   firstName: 'Izan mt k',
  //   lastName: 'Ck',
  //   emailId: 'izan123@gmail.com',
  //   password: 'izan@123',
  // });
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existUser = await User.findOne({ emailId });
    if (existUser) {
      return res.status(400).json({ message: 'User already exist' });
    }

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    // Generates a JWT (JSON Web Token) using the getJWT method
    const token = await savedUser.getJWT();

    // Sets a cookie named token with the generated JWT and an expiration time of 8 hours.
    res.cookie('token', token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: 'User Added successfully!', data: savedUser });
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // Finds the user from database by email using User.findOne .
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    // Validates the password using the validatePassword method of the User model
    // using bcrypt.compare
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      // Sets a cookie named token with the generated JWT and an expiration time of 8 hours.
      // whenever logines,  a new cookie is created by the server and given into the client.
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      // res.send(user);
      res.json({ message: 'User Logined successfully!', user: user });
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

authRouter.post('/logout', async (req, res) => {
  // just setting cookie token as null, and expiry time as current time
  res.cookie('token', null, {
    expires: new Date(Date.now()),
  });
  res.send('Logout Successful!!');
});

module.exports = authRouter;
