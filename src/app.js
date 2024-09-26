const express = require('express');
const connectDB = require('./config/database');
const app = express();
const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const User = require('./models/user');

app.use('/test', (req, res) => {
  res.send('Hello, world!');
});

app.use('/hello', (req, res) => {
  res.send('Hello, world!');
});

app.post('/signup', async (req, res) => {
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
    const token = await savedUser.getJWT();

    res.cookie('token', token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: 'User Added successfully!', data: savedUser });
  } catch (err) {
    res.status(400).send('Error saving the user');
  }
});

connectDB()
  .then(() => {
    console.log('Database connection established...');
    app.listen(7777, () => {
      console.log('Server is successfully listening on port 7777...');
    });
  })
  .catch((err) => {
    console.error('Database cannot be connected!!');
  });

// app.listen(7777, () => {
//   console.log(`Server listening on port 7777...`);
// });
