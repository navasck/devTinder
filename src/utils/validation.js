const validator = require('validator');

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error('Name is not valid!');
  } else if (!validator.isEmail(emailId)) {
    throw new Error('Email is not valid!');
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('Please enter a strong Password!');
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    'firstName',
    'lastName',
    'photoUrl',
    'gender',
    'age',
    'about',
    'skills',
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

const validateResetPasswordData = (req) => {
  const { emailId, oldPassword, newPassword } = req.body;

  if (!emailId || !oldPassword || !newPassword) {
    throw new Error('Missing required fields');
  }

  // Additional validation checks can be added here, such as:
  // - Data type validation
  // - Length validation
  // - Password complexity validation
  // - Email format validation

  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
  validateResetPasswordData,
};
