const express = require("express");
const auth = require("../middleware/auth");
const _ = require("lodash");
const router = express.Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const {
  createUser,
  validateUser,
  checkUserExists,
  hashPassword,
  getUser,
} = require("../api/userApi");
const validate = require("../middleware/validate");

router.get("/me", auth, async (req, res) => {
  const user = await getUser(req.user._id);
  res.send(user);
});

router.post("/", validate(validateUser), async (req, res) => {
  let user = await checkUserExists(req.body.email);
  if (user) return res.status(400).send("user already exists..");

  hashedPassword = await hashPassword(req.body.password);

  user = await createUser(req.body.name, req.body.email, hashedPassword);

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
