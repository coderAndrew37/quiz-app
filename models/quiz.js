const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: Number,
    },
  ],
  reward: Number,
});

module.exports = mongoose.model("Quiz", quizSchema);
