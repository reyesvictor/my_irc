const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const { create, read, billetDelete, billetCheck, edit, commentCreate, commentDelete, getAll, search } = require("./blogController");
const { blogCreateValidator, blogDeleteValidator, blogSearchValidator } = require("./blogValidator");
const { runValidation } = require("../validation");

router
  .get("/", (req, res) => {
    //get all billets    
    res.json({
      data: "You hit the Blog GET endpoint !",
    });
  })
  // .get('/:login', (req, res) => {
  //   console.log(req.qurey, req.body, '======marker======plier--------');
    
  // })
  .get('/search/:params', search)
  .get('/billets/all', getAll)
  .get('/:login', read)
  .post('/billetDelete/:_id', billetDelete)
  .post("/billetCreate", blogCreateValidator, runValidation, create)
  .post("/billetRead", read)
  .get("/billetEdit/:_id/check", billetCheck)
  .post("/billetEdit/:_id/edit", blogCreateValidator, runValidation, edit)
  .post("/commentCreate", commentCreate)
  .delete("/commentDelete", commentDelete)
  .delete("/billetRead", blogDeleteValidator, runValidation, read);

module.exports = router;
