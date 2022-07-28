const { items } = require("joi/lib/types/array");
const jwt = require("jsonwebtoken");
const { User } = require("../../../api/userApi");
const config = require("config");
const mongoose = require("mongoose");

describe("user.generateAuthToken", () => {
  it("should generate a valid json web token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId(),
      isAdmin: true,
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject(payload);
  });
});
