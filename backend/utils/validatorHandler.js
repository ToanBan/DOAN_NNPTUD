const { body, validationResult: expressValidationResult } = require('express-validator');

let options = {
  password: {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }
}

const RegisterValidator = [
  body('email')
    .notEmpty().withMessage("Email không được để trống")
    .bail()
    .isEmail().withMessage("Email sai định dạng"),
  body('username')
    .notEmpty().withMessage("Username không được để trống")
    .bail()
    .isAlphanumeric().withMessage("Username chỉ được chứa chữ và số"),
  body('password')
    .notEmpty().withMessage("Password không được để trống")
    .bail()
    .isStrongPassword(options.password)
    .withMessage(`Password phải dài ít nhất ${options.password.minLength} ký tự, chứa ít nhất ${options.password.minUppercase} chữ hoa, ${options.password.minLowercase} chữ thường, ${options.password.minNumbers} số và ${options.password.minSymbols} ký tự đặc biệt`),
  body('fullName')
    .optional()
    .isString().withMessage("FullName phải là chuỗi ký tự"),
];

function handleValidationErrors(req, res, next) {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
}

module.exports = {
  RegisterValidator,
  handleValidationErrors
};