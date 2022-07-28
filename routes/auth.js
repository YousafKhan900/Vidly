const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const router = express.Router();
const { checkUserExists } = require("../api/userApi");
const validate = require("../middleware/validate");

router.post("/", validate(validateAuth), async (req, res) => {
  let user = await checkUserExists(req.body.email);
  if (!user) return res.status(400).send("invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("invalid email or password");

  const token = user.generateAuthToken();

  res.send(token);
});

function validateAuth(user) {
  const schema = {
    email: Joi.string().min(5).email().required(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
}

module.exports = router;
