const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .trim(),
  body('zoneName')
    .notEmpty()
    .withMessage('Zone name is required')
    .trim(),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),
  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  body('pinCode')
    .matches(/^\d{6}$/)
    .withMessage('PIN code must be 6 digits'),
  validateRequest
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('zoneName')
    .notEmpty()
    .withMessage('Zone name is required')
    .trim(),
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation,
  validateRequest
};