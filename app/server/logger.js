var path = require("path");
var winston = require("winston");
var config = require("./config");
var mkdirp = require("mkdirp");

var logFilename = path.normalize(config.logs.path + "/" + config.name + ".log");

mkdirp(path.normalize(config.logs.path));

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {timestamp: true});
winston.add(winston.transports.File, { filename: logFilename, timestamp: true, json: true });

winston.info("Writing logging to %s", logFilename);

module.exports = winston;