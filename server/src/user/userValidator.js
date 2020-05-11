const { check } = require("express-validator");

exports.userRegisterValidator = [
  check("login").not().isEmpty().withMessage("Login is required."),
  check("login").isLength({ min: 5, max: 20 }).withMessage("Login between 5 and 20 letters is accepted."),
  check("email").not().isEmpty().withMessage("Email is required."),
  check("email").matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "i").withMessage("A correct email is required."),
  // check("email").isEmail().withMessage("A correct email is required."),
  check("password").not().isEmpty().withMessage("Password is required."),
  check("confirmationPassword").not().isEmpty().withMessage("ConfirmationPassword is required."),
];


exports.userLoginValidator = [
  check("email").not().isEmpty().withMessage("Email is required."),
  check("email").matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "i").withMessage("A correct email is required."),
  check("password").not().isEmpty().withMessage("Password is required."),
];
