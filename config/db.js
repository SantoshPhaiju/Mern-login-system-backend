const mongoose = require("mongoose");

const connectDB = async () =>{
    await mongoose.connect("mongodb://localhost:27017/node_auth");
    console.log("Mongodb connected");
}

module.exports = connectDB;