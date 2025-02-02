const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates
  },
});

const sendOtp = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    // html:msg
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

const sendUserDetailsEmail = async (email, userDetails) => {
  try {
    // Construct the email message (HTML is recommended for better formatting)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome!', // Or a more personalized subject
      html: `
        <p>Hello ${userDetails.name || 'User'},</p>
        <p>Welcome to our platform!</p>
        <p>Here are your details:</p>
        <ul>
          ${Object.entries(userDetails)
            .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
            .join('')}
        </ul>
        <p>We're excited to have you.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('User details email sent successfully');
  } catch (error) {
    console.error('Error sending user details email:', error);
    throw new Error('Failed to send user details email'); // Re-throw for handling upstream
  }
};

const run = async (subject, body, toEmailId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmailId,
      subject,
      text: body,
    };
    await transporter.sendMail(mailOptions);
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'MessageRejected') {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

module.exports = {
  sendOtp,
  sendUserDetailsEmail,
  run,
};

// sendOtp('liyanathasni@gmail.com', '987876');

// Example usage (after a user logs in):
// ... your login logic ...
// const userDetails = {
//   name: 'liyana thasni',
//   email: 'liyanathasni@gmail.com',
//   username: 'liyana123',
//   // ... other user details
// };

// sendUserDetailsEmail(userDetails.email, userDetails)
//   .then(() => {
//     // Handle success (e.g., redirect user)
//   })
//   .catch((error) => {
//     // Handle error (e.g., display error message)
//     console.error('Error during sending email:', error);
//   });
