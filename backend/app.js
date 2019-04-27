require("express-async-errors");
const winston = require("winston");
const config = require("config");
const express = require("express");
const scraperRoutes = require("./routes/scraper.js");
const registerRoutes = require("./routes/register.js");
const loginRoutes = require("./routes/login.js");
const homeRoute = require("./routes/home.js");
const dataRoutes = require("./routes/data.js");
const whitelist = require("./middleware/whitelist.js");
const error = require("./middleware/error.js");
const scraperService = require("./services/scraperService");
const dbService = require("./services/dbService");
const app = express();

// Uncaught errors
process.on("uncaughtException", ex => {
  console.log("Uncaught exception");
  winston.error(ex.message, ex);
});

// Logging
// winston.add(winston.transports.File, { filename: "logfile.log" });

// Middleware
app.use(whitelist);
app.use(express.json());

// Routes
app.use("/api/v1/register", registerRoutes);
app.use("/api/v1/login", loginRoutes);
app.use("/api/v1/scrapertask", scraperRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/", homeRoute);
app.use(error);

// Configuration
console.log("Application name: " + config.get("name"));

// Start
const port = process.env.PORT || 8080;
var server = app.listen(port, async function() {
  // Queue active tasks
  process.env.LOAD_ACTIVE_TASKS_ON_START = 'true'
  if (process.env.LOAD_ACTIVE_TASKS_ON_START === 'true') {
    let tasks = await dbService.searchScraperTask({ active: true });
    tasks.map(task => {
      let id = task._id;
      console.log("Queueing active task: ", id);
      scraperService
        .queueJob("scrape", id)
        .then(dbService.setQueuedStatus(id, true))
        .catch(err => {
          winston.error(err);
          console.log("Failed to queue task");
        });
    });
  }

  var host = server.address().address;
  var port = server.address().port;
  console.log("running at http://" + host + ":" + port);
});
