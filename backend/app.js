require("express-async-errors");
const winston = require("winston");
const config = require("config");
const Joi = require("joi");
const express = require("express");
const scraperRoutes = require("./routes/scraper.js");
const whitelist = require("./middleware/whitelist.js");
const error = require("./middleware/error.js");
const app = express();

// Uncaught errors
process.on('uncaughtException', (ex) => {
    console.log("Uncaught exception");
    winston.error(ex.message, ex);
});

// Logging
winston.add(winston.transports.File, { filename: 'logfile.log' });

// Middleware
app.use(whitelist)
app.use(express.json());

// Routes
app.use("/api/scraper", scraperRoutes);
app.use(error);

// Configuration
console.log('Application name: ' + config.get('name'))

// Start
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
