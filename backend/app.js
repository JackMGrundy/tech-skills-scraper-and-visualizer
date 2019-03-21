require("express-async-errors");
const winston = require("winston");
const config = require("config");
const Joi = require("joi");
const express = require("express");
const scraperRoutes = require("./routes/scraper.js");
const homeRoute = require("./routes/home.js");
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
app.use("/", homeRoute);
app.use(error);

// Configuration
console.log('Application name: ' + config.get('name'))
console.log("test")



/////////////////////////////////////////////
// DB test
const mongoose = require("mongoose");

// "mongodb://ec2-35-166-23-8.us-west-2.compute.amazonaws.com:27017/INDEED"

mongoose
  .connect("mongodb://mongo:27017/testDB")
  .then(() => console.log("Connected to Mongo Woohoo!!!"))
  .catch(err => console.log("something broke with Mongo : ( ", err));

const testSchema = new mongoose.Schema({
  i: String,
  hope: String,
  this: [String],
  works: String
});

const Test = mongoose.model("Test", testSchema);
async function createTestDoc() {
  const entry = new Test({
    i: "I",
    hope: "HOPE",
    this: ["THIS", "STILL"],
    works: "WORKS"
  });

  const result = await entry.save()
  console.log("result", result);
}

createTestDoc();
/////////////////////////////////////////////////////




// Start
const port = process.env.PORT || 8080;
// app.listen(port, () => console.log(`Listening on port ${port}...`));
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('running at http://' + host + ':' + port)
});
// app.listen(port, () => console.log('Server listening:', `http://${server.address().address}:${server.address().port}`));


