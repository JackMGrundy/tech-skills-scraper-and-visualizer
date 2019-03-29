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
    username: String
  },
  { versionKey: false }
);

const ScraperTask = mongoose.model(
  "scraper_task",
  scraperTaskSchema,
  "scraper_task"
);

createScraperTask = async params => {
  try {
    const entry = new ScraperTask(params);
    const result = await entry.save();
    return result;
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
  const scraperTask = ScraperTask.find(params);
  return scraperTask;
};

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String
  },
  { versionKey: false }
);

const User = mongoose.model("user", userSchema, "user");

searchUsername = async username => {
  const data = { username: username };
  const res = User.find(data);
  return res;
};

createUser = async (username, password) => {
  try {
    const entry = new User({ username: username, password: password });
    const result = await entry.save();
    return result;
  } catch (e) {
    return e;
  }
};

getUserId = async (username) => {
  const data = { username: username };
  const res = User.find(data);
  // console.log("res: ", res);
  return res
}

validateUsernamePassword = async(username, password) => {
  const data = { username: username, password: password}
  const res = User.find(data);
  // Res will be nonempty if match found
  return res;
}


module.exports.createScraperTask = createScraperTask;
module.exports.searchScraperTask = searchScraperTask;
module.exports.searchUsername = searchUsername;
module.exports.createUser = createUser;
module.exports.validateUsernamePassword = validateUsernamePassword;
module.exports.getUserId = getUserId;
