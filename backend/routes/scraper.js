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

    // Add job to DB
    console.log("adding scraper task to db");
    const r = await dbService.upsertScraperTask(payload);
    
    let _id;
    if (r !== null) {
       _id  = r._id;
    } else {
       _id  = dbService.searchScraperTask(payload)._id;
    }

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
  });
  // }

  // User is requesting their tasks
  router.post("/retrieveTasks", auth, async (req, res) => {
    console.log("Retrieving user's tasks");
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

  // User is requesting to delete a task
  router.delete("/deleteTask", (req, res) => {
    console.log("Deleting user's task");

    console.log("REQ: \n\n\n\n", Object.keys(req));
    console.log("\n\n\n", req.body);
    let payload = JSON.parse(req.body.payload);
    console.log("Req: ", payload);
    const task = dbService.searchScraperTask(payload);
    if (!task) return res.status(404).send('The task was not found');

    const r = dbService.deleteScraperTask(payload);
    console.log("RRRR: ", r)

    res.status(200).send("deleted");
  });



module.exports = router;
