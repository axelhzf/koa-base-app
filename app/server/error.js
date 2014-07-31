var config = require("./config");
var http = require('http');
module.exports = error;

function error(opts) {
  opts = opts || {};

  // template
  var path = opts.template || __dirname + '/error.html';

  // env
  var env = config.env;

  return function *error(next){
    try {
      yield next;
      if (404 == this.response.status && !this.response.body) this.throw(404);
    } catch (err) {
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      // accepted types
      switch (this.accepts('html', 'text', 'json')) {
        case 'text':
          if ('development' == env) this.body = err.message
          else if (err.expose) this.body = err.message
          else throw err;
          break;

        case 'json':
          if ('development' == env) this.body = { error: err.message }
          else if (err.expose) this.body = { error: err.message }
          else this.body = { error: http.STATUS_CODES[this.status] }
          break;

        case 'html':

          var stack = err.stack;

          yield this.render("error/error", {
            env: env,
            ctx: this,
            request: this.request,
            response: this.response,
            error: err.message,
            stack: stack,
            status: this.status,
            code: err.code
          });
          break;
      }
    }
  }
}