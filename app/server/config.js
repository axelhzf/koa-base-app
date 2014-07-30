var path = require("path");
var _ = require("underscore");

var configurations = {
  base: {
    name: "koa-base-app",
    port: process.env.PORT || 3000,
    keys: ['some secret hurr'],
    db: {
      username: "root",
      password: "",
      database: "koa-base-app"
    },
    fb: {
      clientId: process.env.FB_ID,
      clientSecret: process.env.FB_SECRET,
      callbackUrl: ""
    },
    logs: {
      path: path.join(__dirname, "../../logs")
    },
    uploads: {
      path: path.join(__dirname, "../../uploads")
    }
  },
  development: {},
  test: {},
  production: {}
};

var env = process.env.NODE_ENV || "development";

console.log("Loading configuration: " + env);

var config = configurations.base;
config.env = env;
if (configurations[env]) {
  _.extend(config, configurations[env])
}

module.exports = config;