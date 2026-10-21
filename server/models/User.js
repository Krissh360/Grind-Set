const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  email: String,
  password: String,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);