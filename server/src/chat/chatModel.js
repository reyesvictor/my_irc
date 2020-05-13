const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;

const chatSchema = new mongoose.Schema(
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
    author_password: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true } // last connection
);

module.exports = mongoose.model("Chat", chatSchema);
