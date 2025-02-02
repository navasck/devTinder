const express = require('express');
const connectDB = require('./config/database');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('./utils/cronjob');
// const { sendOtp, sendUserDetailsEmail } = require('./utils/sendMail');

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Use Helmet middleware
// app.use(helmet()) - and Helmet will automatically set a variety of security-enhancing headers. These headers help protect against common web vulnerabilities like Cross-Site Scripting (XSS), clickjacking, and more.

app.use(helmet());

// Rate limiting
// rateLimit(): This function creates a new instance of the rateLimit middleware.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

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
