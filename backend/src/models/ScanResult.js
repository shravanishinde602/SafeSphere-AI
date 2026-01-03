const mongoose = require("mongoose");

const ScanResultSchema = new mongoose.Schema({
  inputType: {
    type: String,
    enum: ["url", "email"],
    required: true
  },
  inputValue: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    enum: ["Safe", "Suspicious", "Phishing"],
    required: true
  },
  confidenceScore: Number,
  explanation: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ScanResult", ScanResultSchema);