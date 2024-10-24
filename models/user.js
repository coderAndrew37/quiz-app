const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  earnings: { type: Number, default: 0 },
  emailToken: { type: String },
});

module.exports = mongoose.model("User", userSchema);
