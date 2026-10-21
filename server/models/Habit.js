const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: String,
  title: String,
  completedDates: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Habit", habitSchema);