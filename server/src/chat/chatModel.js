const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;

const chatSchema = new mongoose.Schema(
  {
    chat: {
      type: String,
      trim: true,
      unique: true,
      // required: true,
      min: 5,
      max: 20
    },
    author_password: {
      type: String,
      trim: true,
      required: true,
    },
    last_connection: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // last connection
);

module.exports = mongoose.model("Chat", chatSchema);
