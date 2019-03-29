const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();
const dbService = require("../services/dbService");
const jwt = require("jsonwebtoken");
const config = require("config");

router.get("/", async (req, res, next) => {
  let payload = JSON.parse(req.query["params"]);
  res.status(200).send("ayo is this live");

  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res) => {
  console.log("Logging in user");
  let payload = JSON.parse(req.body.payload);
  console.log(payload)

  //   Check if the username/password combo is valid
  const check = await dbService.validateUsernamePassword(payload.username, payload.password);

  if (check.length !== 1) {
    res.status(400).send("Invalid username/password");
  } else {
    //   Login user
    const {username} = payload;
    const userData = await dbService.getUserId(username);
    const {id} = userData;

    // Create json web token
    const token = jwt.sign(
        { username: username, id: id },
        config.get("jwtPrivateKey")
      );

    // Set headers and respond
    res
    .header("access-control-allow-headers", "x-auth-token")
    .header("x-auth-token", token)
    .status(200)
    .send({ token: token });
  }
});

module.exports = router;
