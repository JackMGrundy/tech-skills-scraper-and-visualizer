const express = require("express");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const router = express.Router();
const scraperService = require("../services/scraperService");
const dbService = require("../services/dbService");

// User submitted a new task
router.put("/", auth, async (req, res) => {
  console.log("Posting new scraper task");
  let payload = JSON.parse(req.body.payload);

  // Get username from token - provided by auth middleware
  payload.username = req.username;
  console.log("Payload: ", payload);

  // Check if this an edit or a create
  let id = payload.id;
  if (id === "") {
    console.log("Creating new task");

    // Check if the user has exceeded the maximum number of tasks allowed
    let userDetails = await dbService.searchUsername(payload.username);
    userDetails = userDetails[0];
    console.log(userDetails);
    if (userDetails.numTasks === parseInt(process.env.MAX_TASKS_PER_USER)) {
      console.log("Attempt to exceed max # of allowed tasks");
      res
        .status(400)
        .send("You have already created the max # of allowed tasks");
      return;
    }

    delete payload.id;
    id = await dbService.createScraperTask(payload);

    // Increase the # of tasks the user owns
    let check = await dbService.updateUserTasksCount(
      payload.username,
      userDetails.numTasks + 1
    );
    console.log(check)


    // By default, insert new tasks into the queue
    console.log("Submitting task id to scraper: ", id);
    scraperService
      .queueJob("scrape", id)
      .then(dbService.setQueuedStatus(id, true))
      .catch(err => {
        winston.error(err);
      });
  } else if (id !== "") {
    console.log("Editing task");

    // Confirm this user owns the task
    if (!dbService.confirmTaskOwnership) {
      res.status(400).send("You do not own this task");
    } else {
      const r = await dbService.upsertScraperTask(payload);
    }

    // Do not automatically send updating tasks to queue to be scraped
  } else {
    res.status(400).send("Invalid operation");
  }

  res.status(200).send("Success");
});

// update status of task to active or inactive
// Requeuing is controlled by active field in a scraperTask.
// This route deals with users requesting a change to a task status (active or inactive)
// queued and changed to active => Update status of task. The task will automatically run again when its current round finishes
// queued and changed to inactive => Update status of task. The task will run one more time but won't be queued again
// !queued and changed to inactive  => Update status of task. The task will not be run again
// !queued and changed to active  => Update status of task AND add to queue
router.post("/taskstatus", auth, async (req, res) => {
  const { id, active } = req.body.payload;
  let task = await dbService.searchScraperTask({ _id: id });
  task = task[0];
  const { queued } = task;

  await dbService.upsertScraperTask({ id: id, active: active });

  if (!queued && active) {
    console.log("Submitting task id to scraper: ", id);
    scraperService
      .queueJob("scrape", id)
      .then(dbService.setQueuedStatus(id, true))
      .catch(err => {
        winston.error(err);
      });
  }

  res.status(200).send("Success");
});

// User is requesting their tasks
router.get("/", auth, async (req, res) => {
  console.log("Retrieving user's tasks");

  // Username verified in auth middleware
  const payload = { username: req.username };

  // Retrieve users scraper tasks
  const tasks = await dbService.searchScraperTask(payload);

  res.status(200).send(tasks);
});

// User is requesting to delete a task
router.delete("/:taskId", auth, async (req, res) => {
  console.log("Deleting user's task");
  const id = req.params.taskId;
  const payload = { _id: id };
  let task = await dbService.searchScraperTask(payload);
  task = task[0];
  if (!task) return res.status(404).send("The task was not found");
  const r = await dbService.deleteScraperTask(payload);

  // Decrease number of user tasks
  // Get username from token - provided by auth middleware
  let userDetails = await dbService.searchUsername(req.username);
  userDetails = userDetails[0];
  await dbService.updateUserTasksCount(
    req.username,
    userDetails.numTasks - 1
  );

  res.status(200).send("Deleted");
});

//  TODO: CLEANUP
//  TODO: SECURE
// Add scraperTask (identified by Mongo id) to queue to be scraped
router.post("/", async (req, res) => {
  const id = req.body.jobId;
  const status = req.body.status;
  const error = req.body.error;

  console.log("Returned status of: ", status, " for task: ", id);

  // Get task details
  let task = await dbService.searchScraperTask({ _id: id });
  let taskStatus;

  // Task was deleted while job was queued
  if (task.length === 0) {
    console.log("Task was deleted while job was queued. Delete collected data");
    // Deleted collected data
    dbService.deleteJobPosts(id);
    taskStatus = false;
  } else if (status === "success") {
    task = task[0];
    taskStatus = task.active;
    const numNewPosts = req.body.numNewPosts;
    const updates = { id: id };

    // Update last scraped field
    let currentdate = new Date();

    let lastScraped =
      "" +
      currentdate.getFullYear() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getDate() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    updates.lastScraped = "" + lastScraped;

    // Update # of total jobs scraped
    let totalJobsScraped = task.totalJobsScraped + numNewPosts;
    updates.totalJobsScraped = totalJobsScraped;

    // Update # of total scrapes attempted
    updates.totalScrapes = task.totalScrapes + 1;

    // Update max number of retries
    updates.maxRetries = 2;

    console.log("Making updates: ", updates);

    const r = await dbService.upsertScraperTask(updates);
    // TODO: handle failure to upsert 
  }
  // Scraper failed to complete task
  else if (status === "failed") {
    print("ERROR: ", error)
    task = task[0];
    taskStatus = task.active;
    const retries = task.maxRetries;
    let updates = {};
    if (retries === 0) {
      console.log("Exhausted retries. Giving up.");
      dbService.setQueuedStatus(id, false); //Set status to not queued
      updates = {
        id: id,
        active: false,
        error: "Failed to scrape",
        maxRetries: 2
      };
    } else {
      updates = {
        id: id,
        error: "Failed to scrape",
        maxRetries: retries - 1
      };
    }
    const r = await dbService.upsertScraperTask(updates);
  }

  // If task is still active (user may have turned it off) add back to queue
  if (taskStatus === true) {
    console.log("Active task. Adding to queue.");
    scraperService
      .queueJob("scrape", id)
      .then(dbService.setQueuedStatus(id, true)) //Set status to queued
      .catch(err => {
        winston.error(err);
      });
  } else {
    console.log("Non active task. Done.");
    dbService.setQueuedStatus(id, false); //Set status to queued
  }

  res.send(200);
});

module.exports = router;
