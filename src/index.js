require("dotenv").config();
const express = require("express");
const port = process.env.PORT
const cors = require("cors");
const app = express();
const connectDB = require("../config/db");

app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/auth', require('../routes/auth'));

app.get("/", (req, res) =>{
    res.send("Welcome to backend");
});

app.listen(port, () =>{
    console.log(`Backend is running on http://localhost:${port}`);
});