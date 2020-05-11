const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const { register } = require("./userController");
const { login } = require("./userController");
const { userRegisterValidator, userLoginValidator } = require("./userValidator");
const { runValidation } = require("../validation");

router
  .get("/register", (req, res) => {
    console.log("Get register");
    res.json({
      data: "You hit the register GET endpoint !",
    });
  })
  .post("/register", userRegisterValidator, runValidation, register);

router.post("/login", userLoginValidator, runValidation, login);

module.exports = router;
