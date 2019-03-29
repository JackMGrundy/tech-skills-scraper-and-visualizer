const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();
const scraperService = require("../services/scraperService");
const dbService = require("../services/dbService");
const jwt = require("jsonwebtoken");
const config = require("config");

router.get("/", async (req, res, next) => {
  let payload = JSON.parse(req.query["params"]);
  res.status(200).send("ayo is this live");

  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res) => {
  console.log("Registering new user");
  let payload = JSON.parse(req.body.payload);

  //   Check if the username already exists
  const duplicate = await dbService.searchUsername(payload.username);
  if (duplicate.length !== 0) {
    res.status(400).send("Username already taken");
  } else {
    //   Insert user into DB
    const { _id, username } = await dbService.createUser(
      payload.username,
      payload.password
    );

    // Create json web token
    const token = jwt.sign(
      { username: username, id: _id },
      config.get("jwtPrivateKey")
    );

    // Set headers and respond
    res
    .header("Access-Control-Expose-Headers", "x-auth-token")
    .header("x-auth-token", token)
    .status(200)
    .send({ token: token });
  }
});

module.exports = router;
