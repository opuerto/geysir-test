var Product = angular.module('Product', ['ngResource']);
//test token : 4F301E2A-8C23-4CEB-AB0C-082F6DEB1A6B
//geysir token:545b4c10-b193-4274-9531-afb589c548cd
const apiInfo = {
  proxyUrl: "https://cors-anywhere.herokuapp.com/",
  url: "http://www2.geysir.is/hub/api/json/reply/",
  token: "4F301E2A-8C23-4CEB-AB0C-082F6DEB1A6B"
}
Product.controller('mainCtrl', function($scope,
  $location, slidesSvc,
  getVehicleByIdSvc, getVehicleByIdSvc,
  getPriceForProduct
) {
  $scope.price = 0;

  //call the service to fetch the data about the vehicle
  var vehicleData = null;
  var now = moment();
  getVehicleByIdSvc.fetchData().then(function(response) {
    vehicleData = response.data.result;
    //console.log(vehicleData);
  });

  //This section call the service to fetch the list of product locations
  getVehicleByIdSvc.fetchData().then(function(response) {
    var productLocation = response.data;
    console.log(productLocation);
  });


  /*Jquery callbacks and componets */
  //This section controls the datepickers and the times pickers
  $('#daterange').daterangepicker({
    "minDate": now
  })

  $('#daterange').on('apply.daterangepicker', function(ev, picker) {
    //this code it will be trigger when the user hit the apply button
    console.log(picker.startDate.format('DD/MM/YYYY'));
    console.log(picker.endDate.format('DD/MM/YYYY'));
    var startDate = picker.startDate.format('DD/MM/YYYY');
    var endDate = picker.endDate.format('DD/MM/YYYY');
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate,endDate).then(function(response) {
        $scope.price = response.data.result;
    });
  });
  $('#timepicker1').timepicker({
    showMeridian: false,
    defaultTime: '00:00',
    minuteStep: 30,
    maxHours: 24
  });
  $('#timepicker2').timepicker({
    showMeridian: false,
    defaultTime: '00:00',
    minuteStep: 30,
    maxHours: 24

  });
});

//this controller is meant to be used for the slider
Product.controller('slideCtrl', function($scope, slidesSvc) {
  //call the services to fetch the sliders by product
  slidesSvc.getSlides().then(function(response) {
    //get the response from the promise
    this.results = response.data.result;

    //we need to append some divs into the html of the carousel
    for (var i = 0; i < results.length; i++) {
      //only the first div is setted active
      if (i < 1) {
        $('<div/>', {
            "class": 'item active slideShow-photo--bg',
            "style": 'background-image: url(//www.geysir.is/images/normal/' + results[i].path
          })
          .appendTo("#slider-inner");
      } else {
        $('<div/>', {
            "class": 'item slideShow-photo--bg',
            "style": 'background-image: url(//www.geysir.is/images/normal/' + results[i].path
          })
          .appendTo("#slider-inner");
      }

    }

  });

})

/*
  Services
*/
//service to get the slides
Product.service('slidesSvc', function($http) {
  //product id variable
  var productId = $.urlParam('product');
  //set a default product to economy
  if (!productId) {
    productId = 1;
  }

  var data = {
    culture: "en",
    limit: 1000,
    productId: productId,
    token: apiInfo.token
  }

  const endPoint = "GetSlides";
  this.getSlides = function() {
    var promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    return promise;
  }
});

//Service getVehicleById
Product.service('getVehicleByIdSvc', function($http) {
  //product id variable
  var productId = $.urlParam('product');
  //set a default product to economy
  if (!productId) {
    productId = 1;
  }
  var data = {
    cultureCode: "en",
    id: productId,
    token: apiInfo.token
  }
  const endPoint = "GetVehicleById";

  this.fetchData = function() {
    var promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    return promise;
  }
});

//Service GetProductLocations
Product.service('getVehicleByIdSvc', function($http) {
  //product id variable
  var productId = $.urlParam('product');
  //set a default product to economy
  if (!productId) {
    productId = 1;
  }
  var data = {
    activeYn: true,
    locale: "en",
    productId:productId,
    token: apiInfo.token
  }
  const endPoint = "GetProductLocations";
  this.fetchData = function() {
    var promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    return promise;
  }

});

//Service GetPriceLocation
Product.service('getPriceForProduct', function($http) {
  //product id variable
  var productId = $.urlParam('product');
  //set a default product to economy
  if (!productId) {
    productId = 1;
  }

  const endPoint = "GetPriceForProduct";
  this.fetchData = function(startDate,endDate) {
    var data = {
      dropOffDate: endDate,
      pickupDate: startDate,
      productId: productId,
      token: apiInfo.token
    }
    var promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    return promise;
  }

})
