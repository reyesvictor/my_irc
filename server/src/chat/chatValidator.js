const { check } = require("express-validator");

exports.chatCreateValidator = [
  check("title").not().isEmpty().withMessage("Title is required."),
  check("title").isLength({ min: 5, max: 50 }).withMessage("Title between 5 and 50 letters is accepted."),
  check("content").not().isEmpty().withMessage("Content is required."),
];