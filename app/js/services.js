'use strict';

/* Services */

angular.module('myApp.services', ['ngResource']).
  value('version', '0.1')
  .factory('MarketLaunchRepository', ['$resource',  function ($resource) {
    var resource = $resource( "/market_launches.json", {id: "@id"}, {
      'update': { method:'PUT' }
    });



    function usdToChfPotential(usd) {
      return Math.round(parseFloat(usd) * 0.9);
    };

    return {
      query: function (cb) {
        resource.query(function (data) {
          angular.forEach(data, function (row) {

            row.usd_potential = parseFloat(row.usd_potential);

            row.getChfPotential = function () {
              return usdToChfPotential(this.usd_potential);
            };

            row.getTimeFrame = function () {
              return "Q" + this.quarter + " " + this.year;
            };
          });
          cb(data);
        });
      },
      save: function(data, cb) {
        resource.save(data, cb);
      },

      remove: function(data, cb) {
        resource.delete({id: data.id}, cb);
      },

      usdToChfPotential: usdToChfPotential

    };
  }]);
