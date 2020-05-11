const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;


const blogSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
    }, 
    billet_id: {
      type: ObjectId,
      required: true,
    },
    user_login: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", blogSchema);
