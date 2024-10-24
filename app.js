const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5200;

// Serve static files from "public" directory
app.use(express.static("public"));

// Mock quiz data (replace with real DB later)
const quizzes = [
  { id: 1, title: "General Knowledge", reward: "$5" },
  { id: 2, title: "Science Quiz", reward: "$10" },
];

// API route to fetch quizzes
app.get("/api/quizzes", (req, res) => {
  res.json(quizzes);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
