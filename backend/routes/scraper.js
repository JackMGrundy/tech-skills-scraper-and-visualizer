const express = require("express");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const router = express.Router();
const scraperService = require("../services/scraperService");
const dbService = require("../services/dbService");

// User submitted a new task
router.post("/createTask", auth, async (req, res) => {
  console.log("Posting new scraper task");
  let payload = JSON.parse(req.body.payload);
  console.log("Payload: ", payload);

  // Check if job already exists in DB. A user cannot have multiple tasks with the same name
  const params = { taskName: payload.taskName, username: payload.username }

  const duplicate = await dbService.searchScraperTask(params);
  if (duplicate.length > 0) {
    res.status(400).send("Duplicate scraper task");
  } else {
    // Add job to DB
    console.log("adding scraper task to db");
    const { _id } = await dbService.createScraperTask(payload);

    // If active, add to queue
    if (payload.active) {
      console.log("submitting to scraper");
      scraperService.queueJob("scrape", _id).catch(err => {
        winston.error(err);
      });
      res.status(200).send("Created scraper task and submitted to scraper");
    } else {
      res.status(200).send("Created scraper task");
    }
  }

  // User is requesting their tasks
  router.post("/retrieveTasks", auth, async (req, res) => {
    console.log("Retrieving users tasks");
    let payload = JSON.parse(req.body.payload);
    console.log("Req: ", payload);

    // Retrieve users scraper tasks
    const tasks = await dbService.searchScraperTask(payload);

    res.status(200).send(tasks);
  });

  // Scraper indicates it finished a job
  router.post("/jobCompleted", async (req, res) => {
    // console.log(req.body);
    res.send(200);
  });

  //   Account for 200 and 400 ranges
});

module.exports = router;
