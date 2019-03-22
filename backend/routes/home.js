const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();
const winston = require('winston');





router.get("/", async (req, res, next) => {
  let payload = JSON.parse(req.query['params']);
  res.status(200).send("Get worked");


  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res, next) => {
  let payload = req.body['params']

  res.status(200).send("Post worked");

  //   Account for 200 and 400 ranges
});



router.all("/pyTest", async (req, res, next) => {
  console.log("Python got back to us");
  res.status(200).send("Python got back to us");

  //   Account for 200 and 400 ranges
});

module.exports = router;
