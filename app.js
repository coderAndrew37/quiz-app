const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Models
const User = require("./models/user.js");
const Quiz = require("./models/quiz.js");
const Result = require("./models/result.js");

// Initialize app
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/earnease", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Email transport (Nodemailer)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// User Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const emailToken = crypto.randomBytes(64).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    emailToken,
  });
  try {
    await newUser.save();

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<h2>Click <a href="http://localhost:${PORT}/verify-email?token=${emailToken}">here</a> to verify your email.</h2>`,
    };
    await transporter.sendMail(mailOptions);
    res.redirect("/verify.html");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error signing up");
  }
});

// Email verification
app.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ emailToken: token });
  if (!user) {
    return res.status(400).send("Invalid token");
  }

  user.isVerified = true;
  user.emailToken = null;
  await user.save();
  res.send("Email verified! You can now login.");
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !user.isVerified) {
    return res.status(400).send("Invalid login or email not verified.");
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    req.session.userId = user._id;
    res.redirect("/quiz.html");
  } else {
    res.status(400).send("Invalid credentials");
  }
});

// Fetch Quizzes
app.get("/api/quizzes", async (req, res) => {
  const quizzes = await Quiz.find();
  res.json(quizzes);
});

// Submit Quiz Result
app.post("/submit-result", async (req, res) => {
  const { userId } = req.session;
  const { quizId, score } = req.body;

  if (!userId) return res.status(401).send("Unauthorized");

  const quiz = await Quiz.findById(quizId);
  const earned = quiz.reward * (score / 100);

  const result = new Result({ userId, quizId, score, earned });
  await result.save();

  await User.findByIdAndUpdate(userId, { $inc: { earnings: earned } });
  res.send("Result submitted");
});

// Fetch Leaderboard
app.get("/api/leaderboard", async (req, res) => {
  const leaderboard = await User.find({ earnings: { $gt: 0 } })
    .sort({ earnings: -1 })
    .limit(10);
  res.json(leaderboard);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
