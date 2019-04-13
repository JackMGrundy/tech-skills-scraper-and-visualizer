const amqp = require("amqplib");
const winston = require("winston");
const mongoose = require("mongoose");

// Connect to DB
console.log(
  "Connecting to: ",
  process.env.DB_CONNECTION_STRING + process.env.DATABASE_NAME
);

mongoose
  .connect(process.env.DB_CONNECTION_STRING + process.env.DATABASE_NAME)
  .then(() =>
    console.log("Connected to Mongo. Database: ", process.env.DATABASE_NAME)
  )
  .catch(err => console.log("Failed to connect to Mongo: ", err));

const scraperTaskSchema = new mongoose.Schema(
  {
    active: Boolean,
    taskName: String,
    jobTitle: String,
    jobAliases: Array,
    skills: Object,
    username: String,
    created: String,
    lastScraped: String,
    totalJobsScraped: Number,
    totalScrapes: Number,
    queued: Boolean,
    maxRetries: Number,
    error: String,
    selectedCities: Array
  },
  { versionKey: false }
);

const ScraperTask = mongoose.model(
  "scraper_task",
  scraperTaskSchema,
  "scraper_task"
);

setQueuedStatus = async (taskId, status) => {
  params = {id: taskId, queued: status}
  let id = await upsertScraperTask(params);
  return await id;
}

createScraperTask = async params => {
  try {
    // Add todays date
    let today = new Date(Date.now());
    var month = today.getUTCMonth() + 1; //months from 1-12
    var day = today.getUTCDate();
    var year = today.getUTCFullYear();
    params.created = year + "/" + month + "/" + day;
    // Last scraped is N/A
    params.lastScraped = "N/A"
    // Initialize total scrapes to 0
    params.totalScrapes = 0
    // Initialize totalJobsScraped to 0
    params.totalJobsScraped = 0
    // Initialize queued to false
    params.queued = false;
    // Initialize max retries
    params.maxRetries = 2;
    // Errors
    params.error = "None"
    // Create id: allows us to return it
    params._id = require('mongodb').ObjectID();

    const result = await ScraperTask.create(params);
    return params._id;
  } catch (e) {
    return e;
  }
};

deleteScraperTask = async params => {
  const res = ScraperTask.deleteOne(params, function(err) {
    if (err) return err;
  });

  // TODO: Delete associated data
  this.deleteJobPosts(params._id);

  return res;
};

// Only updates parameters given to it
upsertScraperTask = async params => {
  try {
    // TODO: cleanup
    if (!params.id) {
      return "ID not set"
    }

    let temp = params.id
    delete params.id

    const result = await ScraperTask.findOneAndUpdate(
      { _id:  temp},
      params,
      { upsert: true }
    );
    return result._id;
  } catch (e) {
    return e;
  }
};

searchScraperTask = async params => {
  Object.keys(params).forEach(key => {
    if (params[key].length === 0) {
      delete params[key];
    }
  });
  const scraperTask = await ScraperTask.find(params);
  return await scraperTask;
};

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    numTasks: Number
  },
  { versionKey: false }
);

const User = mongoose.model("user", userSchema, "user");

// Given a username and taskId, check if the user owns the task
confirmTaskOwnership = async (username, taskId) => {
  const scraperTask = await ScraperTask.find( { _id: taskId} );
  return await (scraperTask.username === username);
}

searchUsername = async username => {
  const data = { username: username };
  const res = User.find(data);
  return res;
};

createUser = async (username, password) => {
  try {
    const entry = new User({ username: username, password: password, numTasks: 0 });
    const result = await entry.save();
    return result;
  } catch (e) {
    return e;
  }
};

updateUserTasksCount = async (username, num) => {
  try {
    const result = await User.findOneAndUpdate(
      { username:  username},
      { numTasks: num},
      { upsert: true }
    );
    return result._id;
  } catch (e) {
    return e;
  }
}

getUserId = async username => {
  const data = { username: username };
  const res = User.find(data);
  // console.log("res: ", res);
  return res;
};

validateUsernamePassword = async (username, password) => {
  const data = { username: username, password: password };
  const res = User.find(data);
  // Res will be nonempty if match found
  return res;
};


const jobPostSchema = new mongoose.Schema(
  {
    scraperTaskId : String,
    posted : String,
    city : String,
    state : String,
    technologies : [String],
    jobkey : String,
    taskName : String,
    username : String,
    title: String,
    company: String,
    experience: String
  },
  { versionKey: false }
);

const JobPost = mongoose.model("job_post", jobPostSchema, "job_post");

deleteJobPosts = async (scraperTaskId) => {
  console.log("Deleting associated job post for task: ", scraperTaskId);
  const res = JobPost.deleteMany( {scraperTaskId: scraperTaskId}, function(err) {
    if (err) return err;
  });
}

getJobPosts = async (scraperTaskId) => {
  console.log("Retrieving jobs posts for scraper task: ", scraperTaskId);
  const res = await JobPost.find( {scraperTaskId: scraperTaskId}, function(err) {
    if (err) return err;
  }); 
  return res;
}

module.exports.createScraperTask = createScraperTask;
module.exports.searchScraperTask = searchScraperTask;
module.exports.searchUsername = searchUsername;
module.exports.createUser = createUser;
module.exports.validateUsernamePassword = validateUsernamePassword;
module.exports.getUserId = getUserId;
module.exports.upsertScraperTask = upsertScraperTask;
module.exports.deleteScraperTask = deleteScraperTask;
module.exports.setQueuedStatus = setQueuedStatus;
module.exports.confirmTaskOwnership = confirmTaskOwnership;
module.exports.deleteJobPosts = deleteJobPosts;
module.exports.updateUserTasksCount = updateUserTasksCount;
module.exports.getJobPosts = getJobPosts;