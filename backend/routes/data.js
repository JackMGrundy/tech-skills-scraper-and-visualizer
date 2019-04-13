const express = require("express");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const router = express.Router();
const scraperService = require("../services/scraperService");
const dbService = require("../services/dbService");

router.put("/", auth, async (req, res) => {
    console.log("ay");

});


// Retrieve data associated with a user's task
router.get("/:taskId", auth, async (req, res) => {
    const taskId = req.params.taskId;
    console.log("Retrieving job data for task: ", taskId);

    // Retrieve data associated with this task and return
    const jobs = await dbService.getJobPosts(taskId);

    res.status(200).send(jobs);
});


module.exports = router;