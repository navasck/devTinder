const express = require('express');
const app = express();
const port = 8000;

app.use('/test', (req, res) => {
  res.send('Hello, world!');
});

app.use('/hello', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
