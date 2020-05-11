const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;


const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      min: 5,
      max: 20,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    }, 
    user_id: {
      type: ObjectId,
      required: true,
    },
    user_login: {
      type: String,
      trim: true,
      required: true,
    },
    comments: {
      type: Array,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
