var _ = require("underscore");
var angular = require("angular");

var Controller = require("../../common/lib/Controller");

class UsersController extends Controller {
  constructor ($scope, $http) {
    super($scope);
    this.$http = $http;
    this.$.message = "Hello world";

    this.findUsers();
  }

  findUsers () {
    this.$http.get("/api/users", {params: {limit: 3}}).then((result) => {
      this.$.users = result.data;
    });
  }
}

module.exports = UsersController;