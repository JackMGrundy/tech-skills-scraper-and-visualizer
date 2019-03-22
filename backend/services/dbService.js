const amqp = require("amqplib");
const winston = require("winston");
const mongoose = require("mongoose");

// Connect to DB
mongoose
  .connect("mongodb://mongo:27017/" + process.env.DATABASE_NAME)
  .then(() => console.log("Connected to Mongo. Database: ", process.env.DATABASE_NAME))
  .catch(err => console.log("Failed to connect to Mongo: ", err));

const jobSchema = new mongoose.Schema({
  active: Boolean,
  jobTitle: String,
  jobAliases: Array,
  skills: Object
});

const Job = mongoose.model("Job", jobSchema);

createJobDoc = async params => {
  try {
    const entry = new Job(params);
    const result = await entry.save();
    return result;
  } catch (e) {
    return e;
  }
};


searchJobDoc = async params => { 
  Object.keys(params).forEach( (key) => {
    if ( params[key].length === 0 ) {
      delete params[key];
    }
  });
  console.log("updated params: ", params);
  const jobs = Job
    .find(params)
  return jobs;
};

module.exports.createJobDoc = createJobDoc;
module.exports.searchJobDoc = searchJobDoc;