var router = require("koa-router");
var auth = require("./auth");

var indexController = require("./controllers/indexController");

var r = new router();
var logged = auth.ensureAuthenticated;

r.get("/", indexController.index);
r.get("/private", logged, indexController.private);

r.get("auth-fb", "/auth/facebook", auth.routes.auth);
r.get("/auth/facebook/callback", auth.routes.authCallback);
r.get("logout", "/logout", logged, auth.routes.logout);


exports.configure = function (app) {
  app.use(notFound);
  app.use(r.middleware());
};

exports.routeUrl = function () {
  return r.url.apply(r, arguments);
};

function* notFound (next) {
  if (r.match(this.path)) {
    yield next;
    if (this.status === 405) this.throw("405 / Method not Allowed", 405);
  } else {
    this.throw('404 / Not Found', 404)
  }
}