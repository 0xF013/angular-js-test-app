'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ui.bootstrap', 'ngGrid'])
  .controller('GridController', ['$scope', 'MarketLaunchRepository', '$rootScope', '$modal', function ($scope, MarketLaunchRepository, $rootScope, $modal) {

    $scope.marketLaunchCount = 0;
    $scope.pagingOptions = {
      pageSizes: [10, 50, 100],
      pageSize: 10,
      currentPage: 1
    };

    $scope.getPotentials = function(){
      var sum = .0;
      angular.forEach($scope.marketLaunches, function (row) {
        sum += parseFloat(row.usd_potential);
      });

      return {usd: sum, chf: MarketLaunchRepository.usdToChfPotential(sum)};
    };

    $scope.setPagingData = function (data, page, pageSize) {
      var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
      console.log(data, pagedData);
      $scope.marketLaunches = pagedData;
      $scope.marketLaunchCount = data.length;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.getPagedDataAsync = function (pageSize, page) {
      setTimeout(function () {
        MarketLaunchRepository.query(function (data) {
          $scope.setPagingData(data, page, pageSize);
        });
      }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {

      if (newVal !== oldVal) {
        if (newVal.pageSize !== oldVal.pageSize) {
          $scope.pagingOptions.currentPage = 1;
        }
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
      }
    }, true);

    $scope.gridOptions = {
      data: 'marketLaunches',
      enablePaging: true,
      enableRowSelection: false,
      showFooter: true,
      totalServerItems: 'marketLaunchCount',
      footerTemplate: "partials/grid/footer.html",
      columnDefs: [
        {field: "id", displayName: "ID", width: "50px"},
        {field: "title", displayName: "Title"},
        {field: "brand", displayName: "Brand"},
        {field: "getTimeFrame()", displayName: "Launch TimeFrame"},
        {field: "usd_potential", displayName: "Est. Sales Potential (USD)", cellClass: "numeric"},
        {field: "getChfPotential()", displayName: "Est. Sales Potential (CHF)", cellClass: "numeric"},
        {field: "status", displayName: "Status"},
        {field: "Actions", cellTemplate: "partials/grid/actionsCell.html", width: "70px"}
      ],
      pagingOptions: $scope.pagingOptions
    };

    $rootScope.$on("dataChange", function(){
      $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    });

    $scope.edit = function(marketLaunch){
      var modalInstance = $modal.open({
        templateUrl: 'partials/popups/marketLaunchForm.html',
        controller: 'PopupController as popup',
        size: 'md',
        resolve: {
          mode: function() {
            return "edit"
          },
          marketLaunch: function(){
            return angular.copy(marketLaunch);
          }
        }
      });
    };

    $scope.remove = function(marketLaunch) {
      var modalInstance = $modal.open({
        templateUrl: 'partials/popups/confirmRemove.html',
        size: 'sm'
      });

      modalInstance.result.then(function () {
        MarketLaunchRepository.remove(marketLaunch, function(){
          $rootScope.$emit('dataChange');
        });
      }, function () {

      });
    };

  }])
  .controller('MarketLaunchesController', [
    '$scope',
    '$modal',
    'MarketLaunchRepository',
    function ($scope, $modal, MarketLaunchRepository) {

      $scope.showPopup = function () {
        var modalInstance = $modal.open({
          templateUrl: 'partials/popups/marketLaunchForm.html',
          controller: 'PopupController as popup',
          size: 'md',
          resolve: {
            mode: function() {
              return "create"
            },
            marketLaunch: function(){
              return null;
            }
          }
        });
      };
    }])
  .controller('PopupController', [
    '$scope',
    '$modalInstance',
    'MarketLaunchRepository',
    '$rootScope',
    'mode',
    'marketLaunch',
    function ($scope, $modalInstance, MarketLaunchRepository, $rootScope, mode, marketLaunch) {
    console.log(mode);
    this.submitted = false;

    this.marketLaunch = marketLaunch || {
      quarter: "1",
      win_confidential: "low",
      year: "2011",
      status: "To Be Launched"
    };
    this.quarters = [
      {id: "1", name: "Q1"},
      {id: "2", name: "Q2"},
      {id: "3", name: "Q3"},
      {id: "4", name: "Q4"}
    ];
    this.confidentials = [
      "low", "medium", "high"
    ];
    this.years = ["2011", "2012", "2013", "2014"];
    this.ok = function (isValid) {
      this.submitted = true;
      if (!isValid) {
        return;
      }
      MarketLaunchRepository.save(this.marketLaunch, function(launch){
        $rootScope.$emit('dataChange');
      });
      $modalInstance.close();
    };

    this.cancel = function () {
      $modalInstance.dismiss();
    };


  }]);
