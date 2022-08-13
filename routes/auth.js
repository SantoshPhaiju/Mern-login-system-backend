const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendemail");
const crypto = require("crypto");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email and password",
      });
    }
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(isMatch);
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    } else {
      console.log(isMatch);
      sendToken(user, 200, res);
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
});

router.post("/forgotpassword", async (req, res) => {
  // res.send({result: req.user._id});

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).send({ error: "Not a valid account" });
    } else {
      const resetToken = user.getResetPasswordToken();
      await user.save();

      const resetUrl = `http://localhost:8000/api/auth/passwordreset/${resetToken}`;
      const message = `
      <h1>You have requested a password reset </h1>
      <p> Please go through this link to reset your password </p>
      <a href=${resetUrl} clicktracking=off> ${resetUrl} </a>
      `;
      try {
        await sendEmail({
          to: email,
          from: "santoshphaiju@gmail.com",
          subject: "Password reset request",
          text: message,
        });
        res.status(200).json({ success: true, data: "Email Sent" });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        console.log(error);
        res.status(400).send("Email couldn't send");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Email couldn't send");
  }
});

router.put("/passwordreset/:resetToken", async (req, res) => {
  const resetToken = req.params.resetToken;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}})
    if(!user){
      return res.status(400).send({error: "Invalid reset token"});
    }
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();
      res
        .status(201)
        .send({ success: true, data: "Password reset" });
    
  } catch (error) {
      console.log(error);
      res.status(500).send({error: "Internal Server Error"})
  }
  });

const sendToken = async (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};

module.exports = router;
