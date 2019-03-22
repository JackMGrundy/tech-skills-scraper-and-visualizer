const express = require("express");
const asyncMiddleware = require("../middleware/async");
const router = express.Router();
const scraperService = require("../services/scraperService");
const dbService = require("../services/dbService");

router.get("/", async (req, res, next) => {
  let payload = JSON.parse(req.query["params"]);
  res.status(200).send("ayo is this live");

  //   Account for 200 and 400 ranges
});

router.post("/", async (req, res) => {
  console.log("hit endpoint");
  let payload = JSON.parse(req.body.payload);

  console.log(payload);

  // Check if job already exists in DB
  var dupFields = JSON.parse(JSON.stringify(payload));
  delete dupFields['active'];

  const duplicate = await dbService.searchJobDoc(dupFields);
  if (duplicate.length>0) {
    res.status(400).send("Duplicate job");
  } else {
    
    // Add job to DB
    console.log("adding job to db")
    const { _id } = await dbService.createJobDoc(payload);

    // If active, add to queue
    if (payload.active) {
      console.log("submitting to scraper")
      scraperService.queueJob("scrape", _id).catch(err => {
        winston.error(err);
      });
      res.status(200).send("Created job and submitted to scraper");
    } else {
      res.status(200).send("Created job");
    }
  }



  // If active, add to queue


  

  //   Account for 200 and 400 ranges
});

module.exports = router;
