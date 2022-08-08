const express = require("express");
const port = process.env.PORT || 8000

const app = express();

app.get("/", (req, res) =>{
    res.send("Welcome to backend");
});

app.listen(port, () =>{
    console.log(`Backend is running on http://localhost:8000`);
})