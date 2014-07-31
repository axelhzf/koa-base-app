require("traceur-runtime");
var angular = require("angular");
require("angular-route");

var app = angular.module("app", ["ngRoute"]);

var AdminController = require("./controllers/AdminController");

app.controller("AdminController", AdminController);

console.log("admin");

app.config(function ($routeProvider) {
  $routeProvider.when('/', {
    controller: 'AdminController',
    template: require("./templates/admin.jade")
  }).otherwise({
    redirectTo: '/'
  });
});


