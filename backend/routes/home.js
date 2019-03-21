const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();
const winston = require('winston');

const broker = require('./broker');




router.get("/", async (req, res, next) => {
  console.log("Home");
  res.status(200).send("ayo we're home again!");
  
  // Testing rabbit node interface
  console.log("testing rabbit")
  broker.start().catch((err) => {
    winston.error(err);
  });


  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res) => {
  console.log("home post");
  res.status(200).send("posted");

  //   Account for 200 and 400 ranges
});

module.exports = router;
