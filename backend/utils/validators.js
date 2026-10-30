const { body, validationResult } = require('express-validator');

const validateEmail = body('email')
  .isEmail()
  .withMessage('Invalid email format');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

const validateUsername = body('username')
  .isLength({ min: 3 })
  .withMessage('Username must be at least 3 characters')
  .trim()
  .escape();

const validatePhoneNumber = body('phone')
  .optional({ checkFalsy: true })
  .isLength({ min: 10 })
  .withMessage('Phone number must be at least 10 characters');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  handleValidationErrors,
};
