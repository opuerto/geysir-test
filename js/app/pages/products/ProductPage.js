var Product = angular.module('Product', ['ngResource']);

Product.controller('mainCtrl', function($scope, $location, slidesSvc) {
 //p
  // use the service slidesSvc to get get the slides data
  slidesSvc.getSlides().then(function(response) {
    $scope.slides = response.data.result;
    //console.log(this.slides[0].path);
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
      if(i < 1) {
        $('<div/>', {
            "class": 'item active slideShow-photo--bg',
            "style": 'background-image: url(//www.geysir.is/images/normal/'+results[i].path
            })
          .appendTo("#slider-inner");
      }
      else {
        $('<div/>', {
            "class": 'item slideShow-photo--bg',
            "style": 'background-image: url(//www.geysir.is/images/normal/'+results[i].path
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
    token: "4F301E2A-8C23-4CEB-AB0C-082F6DEB1A6B"
  }


  var c = "/hub/api/json/reply/GetSlides"

  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const url = "http://www2.geysir.is/hub/api/json/reply/GetSlides";
  this.getSlides = function() {
    var promise = $http.post(proxyurl + url, JSON.stringify(data));
    return promise;
  }
})
