const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 50 },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

async function createUser(name, email, password) {
  const user = new User({
    name: name,
    email: email,
    password: password,
  });
  await user.save();
  return user;
}

async function getUser(id) {
  return await User.findById(id).select("-password");
}

async function checkUserExists(email) {
  return await User.findOne({ email: email });
}

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).email().required(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = {
  User,
  getUser,
  createUser,
  validateUser,
  checkUserExists,
  hashPassword,
};
