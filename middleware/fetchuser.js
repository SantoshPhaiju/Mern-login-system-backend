const jwt = require("jsonwebtoken");
const User = require("../models/User");

const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(400)
      .send({ error: "Please try to authenticate with valid token" });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifiedToken.id);
    if (!user) {
      return res.status(400).send({ error: "No user found with this id" });
    }

    req.user = user;
    next();
  } catch (error) {
      console.log(error);
    return res.status(500).send({error: error.message});
  }
};

module.exports = fetchuser;
