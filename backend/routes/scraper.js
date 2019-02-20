const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();

router.get("/", async (req, res, next) => {
  console.log("Get it");

  res.status(200).send("ayo");

  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res) => {

  res.status(200).send("posted");

  //   Account for 200 and 400 ranges
});

module.exports = router;
