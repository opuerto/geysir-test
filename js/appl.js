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
  getVehicleByIdSvc, getPriceForProduct,
  getProductLocations
) {
  var now, timeSettings, vehicleData,
  pickUpLocationList, dropOffLocationList;
  now = moment()
  timeSettings = {
      startDate : now.format('DD/MM/YYYY'),
      endDate : now.format('DD/MM/YYYY'),
      startTime : "00:00:00",
      endTime : "00:00:00"
  }
  //call the service to fetch the data about the vehicle
  vehicleData = null;
  pickUpLocationList = [];
  dropOffLocationList = [];
  $scope.pickUpL = pickUpLocationList;
  $scope.dropOff = dropOffLocationList;
  $scope.rentalPrice = 0;
  $scope.locationPrice = 0;


  getVehicleByIdSvc.fetchData().then(function(response) {
    vehicleData = response.data.result;
    //console.log(vehicleData);
  });

  //This section call the service to fetch the list of product locations
  getProductLocations.fetchData().then(function(response) {
    var productLocations = response.data.result;
    pickUpLocationList = getProductLocationByType(0,productLocations);
    dropOffLocationList = getProductLocationByType(1,productLocations);
    $scope.pickUpL = pickUpLocationList;
    $scope.dropOff = dropOffLocationList;
    updateLocationPrice(pickUpLocationList,timeSettings.startTime,timeSettings.endTime);
    updateLocationPrice(dropOffLocationList,timeSettings.startTime,timeSettings.endTime);


  });


  /*Jquery callbacks and componets */
  //This section controls the datepickers and the times pickers
  $scope.showExtraDayMessage = false;
  $('#daterange').daterangepicker({
    "minDate": now
  })

  $('#daterange').on('apply.daterangepicker', function(ev, picker) {
    //this code it will be trigger when the user hit the apply button
    timeSettings.startDate = picker.startDate.format('DD/MM/YYYY');
    timeSettings.endDate = picker.endDate.format('DD/MM/YYYY');
    var startDate = timeSettings.startDate+" "+timeSettings.startTime;
    var endDate = timeSettings.endDate+" "+timeSettings.endTime;
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate,endDate).then(function(response) {
        $scope.rentalPrice = response.data.result;

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


  $('#timepicker1').timepicker().on('hide.timepicker', function(e) {
    var startTime = e.time.value + ":00";
    var startDate = timeSettings.startDate+" "+startTime;
    var endDate = timeSettings.endDate+" "+timeSettings.endTime;
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate,endDate).then(function(response) {
        if(response.data.result > 0)
        $scope.rentalPrice = response.data.result;
        timeSettings.startTime = startTime;

        //Check we should charche an extra day and show the message
        showDayExtraMessage(timeSettings.startTime,timeSettings.endTime);

        // update the price of the locations
        updateLocationPrice(pickUpLocationList,timeSettings.startTime,timeSettings.endTime);
        updateLocationPrice(dropOffLocationList,timeSettings.startTime,timeSettings.endTime);

    });
 });

 $('#timepicker2').timepicker().on('hide.timepicker', function(e) {
   var endTime = e.time.value + ":00";
   var startDate = timeSettings.startDate+" "+timeSettings.startTime;
   var endDate = timeSettings.endDate+" "+endTime;
   //This section call the service to fetch the price for each product
   getPriceForProduct.fetchData(startDate,endDate).then(function(response) {
        if(response.data.result > 0)
       $scope.rentalPrice = response.data.result;
       timeSettings.endTime = endTime;
       showDayExtraMessage(timeSettings.startTime,timeSettings.endTime);

       // update the price of the locations
       updateLocationPrice(pickUpLocationList,timeSettings.startTime,timeSettings.endTime);
       updateLocationPrice(dropOffLocationList,timeSettings.startTime,timeSettings.endTime);

   });
});


/***** Helper functions ********/

showDayExtraMessage = function(timeStart,timeEnd) {
  var same = moment(timeSettings.startDate,'DD/MM/YYYY').isSame(moment(timeSettings.endDate,'DD/MM/YYYY'));
    if(!same) {
      $scope.showExtraDayMessage = moment(timeStart,"HH:mm:ss").isBefore(moment(timeEnd,"HH:mm:ss"));
      console.log($scope.showExtraDayMessage);
    }
}

getProductLocationByType = function(type,products) {
  var list;
  list = [];
  for (var i = 0; i < products.length; i++) {
    if(products[i].type === type && products[i].code !== "<ALL>") {
      products[i].showPrice = 0;
      list.push(products[i]);

    }
  }
  return list;
}

updateLocationPrice = function (list,startTime,endTime) {
    var workStart, workEnd, WsHours,WeHours,WsMinutes,WeMinutes;

  for (var i = 0; i < list.length; i++) {
      WsHours = list[i].workStart.split('PT').
      pop().split('H').shift();
      WeHours = list[i].workEnd.split('PT').
      pop().split('H').shift();
      WsMinutes = list[i].workStart.split('H').
      pop().split('M').shift();
      WeMinutes = list[i].workEnd.split('H').
      pop().split('M').shift();
      workStart = WsMinutes.length > 0 ? WsHours+":"
      +WsMinutes :WsHours+":00";
      workEnd = WeMinutes.length > 0 ? WeHours+":"
      +WeMinutes :WeHours+":00";
      if(moment(startTime,"HH:mm:ss").isBefore(moment(workStart,"HH:mm"))) {
          // time selected for start time is before working hours
          //set the showPrice to the extra price
          list[i].showPrice = list[i].extraPrice;
        } else if (moment(startTime,"HH:mm:ss").isAfter(moment(workEnd,"HH:mm"))) {
          // time selected for start time is after working hours
          //set the showPrice to the extra price
          list[i].showPrice = list[i].extraPrice;
        } else if (moment(endTime,"HH:mm:ss").isBefore(moment(workStart,"HH:mm"))) {
          // time selected for end time if before working hours
          //set the showPrice to the extra price
          list[i].showPrice = list[i].extraPrice;
        } else if (moment(endTime,"HH:mm:ss").isAfter(moment(workEnd,"HH:mm"))) {
          // time selected for end time if after working hours
          //set the showPrice to the extra price
          list[i].showPrice = list[i].extraPrice;

      } else {
         // the selected time is between working hours
         list[i].showPrice = list[i].price;
      }
  }
}



$scope.displayList = function (contentId) {
  /*when the user click on the select,
  toggle between hiding and showing the dropdown content */
  document.getElementById(contentId).classList.toggle("show");
}


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
Product.service('getProductLocations', function($http) {
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
