const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  postedAt: {
    type: String,
    default: new Date().toString(),
  },
});

module.exports = new mongoose.model("Experience",ExperienceSchema);