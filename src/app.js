const express = require('express');
const connectDB = require('./config/database');
const app = express();

app.use('/test', (req, res) => {
  res.send('Hello, world!');
});

app.use('/hello', (req, res) => {
  res.send('Hello, world!');
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
