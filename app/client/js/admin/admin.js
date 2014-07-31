require("traceur-runtime");
var angular = require("angular");
require("angular-route");

var app = angular.module("admin", ["ngRoute"]);

var UsersController = require("./controllers/UsersController");

app.controller("UsersController", UsersController);

app.config(function ($routeProvider) {
  $routeProvider.when('/', {
    controller: 'UsersController',
    template: require("./templates/users.jade")
  }).otherwise({
    redirectTo: '/'
  });
});


