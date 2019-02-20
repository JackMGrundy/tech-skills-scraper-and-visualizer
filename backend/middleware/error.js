const winston = require("winston");

// All uncaught exceptions (should cover 500 range)
module.exports = function(err, req, res, next) {
    // Log the exception
    winston.error(err.message, err);
    res.status(500).send("something went wrong");
}