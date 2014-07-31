var koa = require("koa");

var _ = require("underscore");
var co = require("co");

var koaBody = require("koa-body");
var views = require("koa-views");
var mount = require("koa-mount");
var session = require('koa-session');
var flash = require("koa-flash");
var staticCache = require('koa-static-cache');
//var csrf = require('./lib/csrf');

var auth = require("./auth");
var config = require("./config");
var logger = require("./logger");
var db = require("./db");
var routes = require("./routes");

var app = koa();

app.use(views('views', {
  default: 'jade'
}));

mountStatic("/assets", __dirname + '/../assets');
mountStatic("/assets", __dirname + '/../.assets');

if (config.env === "development") {
  app.use(require("koa-logger")());
}

app.use(require("./error")());
app.use(koaBody());
app.keys = config.keys;
app.use(session());
app.use(flash());
auth.configure(app);


//locals
app.use(function *(next) {
  this.locals = {
    _: _,
    flash: this.flash,
    csrf: this.csrf,
    config: config,
    user: this.passport.user,
    requestPath: this.request.path,
    routeUrl: routes.routeUrl
  };
  yield *next;
});

//routes
routes.configure(app);


// server methods
var server;
exports.start = function* () {
  if (config.env === "development") {
    yield db.syncAllModels();
  }
  server = app.listen(config.port);

  if (config.env === "development") {
    var gulp = require("gulp");
    require("../../gulpfile");
    gulp.start("watch");
  }

};

exports.stop = function* () {
  server.close();
};


//
if (require.main === module) {
  co(function* () {
    yield exports.start()
  })();
}

//
function mountStatic (url, path) {
  var assets = koa();
  assets.use(staticCache(path, {
    maxAge: 2 * 60 * 60
  }));
  app.use(mount(url, assets));
}

// CSRF
//csrf(app);
////app.use(csrf.middleware);
//app.use(function* (next) {
//  // ignore get, head, options
//  if (this.method === 'GET'
//    || this.method === 'HEAD'
//    || this.method === 'OPTIONS'
//    || this.request.type === "multipart/form-data") {
//    return yield* next
//  }
//
//  try {
//    this.assertCSRF(this.request.body)
//  } catch (err) {
//    if (err.status === 403) {
//      this.status = 403;
//      this.body = 'invalid csrf token';
//    } else {
//      this.throw(err);
//    }
//    return
//  }
//
//  yield* next;
//});