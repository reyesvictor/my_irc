const { validationResult } = require("express-validator");

exports.runValidation = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({
      error: err.array()[0].msg,
    });
  }
  next();
};
