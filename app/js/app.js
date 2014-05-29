'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngMockE2E',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MarketLaunchesController'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]).run(function($httpBackend){

    var lastId = 2;

    var launches = [
      {
        "id": "ML01",
        "title": "Summer Launch",
        "brand": "Vinter's Chip",
        "quarter": "2",
        "year": "2011",
        "usd_potential": "12000",
        "status": "To Be Launched",
        "win_confidential": "low"
      },
      {
        "id": "ML02",
        "title": "Winter Launch",
        "brand": "Vinter's Chip",
        "quarter": "4",
        "year": "2011",
        "usd_potential": "10000",
        "status": "To Be Launched",
        "win_confidential": "high"
      }
    ];

    $httpBackend.whenGET("/market_launches.json").respond(function(method, url, data) {
      console.log('whenGet', launches);
      return [200, launches, {}];
    });

    $httpBackend.whenPOST("/market_launches.json").respond(function(method, url, data) {
      var launch = angular.fromJson(data);
      lastId++;
      launch.id = "ML" + lastId;
      launches.push(launch);
      return [200, launch, {}];
    });

    $httpBackend.whenPOST(/^\/market_launches.json\?id=/).respond(function(method, url, data) {
      var launch = angular.fromJson(data);
      var existingLaunch = launches.filter(function(item){
        return item.id == launch.id;
      })[0];
      launches[launches.indexOf(existingLaunch)] = launch;
      return [200, launch, {}];
    });

    $httpBackend.whenDELETE(/^\/market_launches.json\?id=/).respond(function(method, url) {
      var id = url.split("=")[1];
      var existingLaunch = launches.filter(function(item){
        return item.id == id;
      })[0];
      launches.splice(launches.indexOf(existingLaunch), 1);
      console.log(launches);
      return [200, {}, {}];
    });

    $httpBackend.whenGET(/\//).passThrough();
  });


