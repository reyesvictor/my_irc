const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
// const { create, read, billetDelete, billetCheck, edit, commentCreate, commentDelete, getAll, search } = require("./blogController");
const { chatCreateValidator } = require("./chatValidator");
const { runValidation } = require("../validation");

router
  .get("/", (req, res) => {
    console.log("wesh page d'accueil");
    res.send('server is running');
    res.json({
      data: "You hit the Chat GET endpoint !",
    });
  })
  // .get('/search/:params', search)
  // .get('/billets/all', getAll)
  // .get('/:login', read)
  // .post('/billetDelete/:_id', billetDelete)
  // .post("/billetCreate", blogCreateValidator, runValidation, create)
  // .post("/billetRead", read)
  // .get("/billetEdit/:_id/check", billetCheck)
  // .post("/billetEdit/:_id/edit", blogCreateValidator, runValidation, edit)
  // .post("/commentCreate", commentCreate)
  // .delete("/commentDelete", commentDelete)
  // .delete("/billetRead", blogDeleteValidator, runValidation, read);

module.exports = router;
