const express = require('express');
const connectDB = require('./config/database');
const app = express();
// const cookieParser = require('cookie-parser');

app.use(express.json());
// app.use(cookieParser());

const User = require('./models/user');

app.use('/test', (req, res) => {
  res.send('Hello, world!');
});

app.use('/hello', (req, res) => {
  res.send('Hello, world!');
});

app.post('/signup', async (req, res) => {

  // creating a new instance of the User Model
  const user = new User(req.body);
  // const user = new User({
  //   firstName: 'Izan mt k',
  //   lastName: 'Ck',
  //   emailId: 'izan123@gmail.com',
  //   password: 'izan@123',
  // });
  try {
    await user.save();
    res.send('User Added Succesfully');
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
