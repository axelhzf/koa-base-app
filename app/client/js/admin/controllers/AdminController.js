var _ = require("underscore");
var angular = require("angular");

var Controller = require("../../common/lib/Controller");

class AdminController extends Controller {
  constructor ($scope) {
    super($scope);
    this.$.message = "Hello world"
  }
}

module.exports = AdminController;