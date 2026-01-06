require("dotenv").config();

const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/analyze",analyzeRoutes);

app.get("/",(req,res)=> {
    res.json({status:"OK" ,
        message: "SafeSphere AI backend is running"});

});

app.get("/health",(req,res)=>{
  res.status(200).send("OK");
});


module.exports = app;