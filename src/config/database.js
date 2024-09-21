const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://ckndreams:b7kw5DJNO0PyvrqJ@namastedev.aerfr.mongodb.net'
  );
};

module.exports = connectDB;
