require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const analyzeRoutes = require("./routes/analyzeRoutes");

const app = require("./app");

app.use(cors());
app.use(express.json());

app.get("/health",(req,res)=>{
  res.status(200).send("OK");
});

app.use("/api/analyze", analyzeRoutes);

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));