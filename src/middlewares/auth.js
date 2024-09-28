const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send('Please Login!');
    }

    // Verifies the JWT token using jwt.verify with the same secret key used for signing the token.
    const decodedObj = await jwt.verify(token, 'DEV@Tinder$790');

    const { _id } = decodedObj;
    // Finds the user in the database using User.findById.
    const user = await User.findById(_id);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send('ERROR: ' + err.message);
  }
};

module.exports = {
  userAuth,
};
