var router = require("koa-router");
var auth = require("./auth");

var indexController = require("./controllers/indexController");

module.exports = function (app) {
  var r = new router();
  var logged = auth.ensureAuthenticated;

  r.get("/", indexController.index);
  r.get("/private", logged, indexController.private);

  app.use(notFound);
  app.use(r.middleware());

  function* notFound (next) {
    if (r.match(this.path)) {
      yield next;
      if (this.status === 405) this.throw("405 / Method not Allowed", 405);
    } else {
      this.throw('404 / Not Found', 404)
    }
  }

};