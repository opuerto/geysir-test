var Product = angular.module('Product', ['ngResource']);
//test token : 4F301E2A-8C23-4CEB-AB0C-082F6DEB1A6B
//geysir token:545b4c10-b193-4274-9531-afb589c548cd
const apiInfo = {
  proxyUrl: "https://cors-anywhere.herokuapp.com/",
  url: "http://www2.geysir.is/hub/api/json/reply/",
  token: "4F301E2A-8C23-4CEB-AB0C-082F6DEB1A6B"
}

Product.controller('mainCtrl', function($scope, $http,
  $location, slidesSvc,
  getVehicleByIdSvc, getPriceForProduct,
  getProductLocations, getPriceForLocation
) {
  var now, timeSettings, vehicleData,
    pickUpLocationList, dropOffLocationList,
    DropDownSelected;
  now = moment()
  timeSettings = {
    startDate: now.format('DD/MM/YYYY'),
    endDate: now.format('DD/MM/YYYY'),
    startTime: "00:00:00",
    endTime: "00:00:00"
  }
  DropDownSelected = {
    pickUpLocation: {
      id: null,
      code: "",
      price: 0,
      selected: false
    },
    dropOffLocation: {
      id: null,
      code: "",
      price: 0,
      selected: false
    },
    dropDownActive: {
      id:"",
      active:false
    }
  }

  //call the service to fetch the data about the vehicle
  vehicleData = null;
  pickUpLocationList = [];
  dropOffLocationList = [];
  $scope.pickUpL = pickUpLocationList;
  $scope.dropOff = dropOffLocationList;
  $scope.rentalPrice = 0;
  $scope.locationPrice = 0;
  $scope.extrasPrice = 0;


  getVehicleByIdSvc.fetchData().then(function(response) {
    vehicleData = response.data.result;
    $scope.vehicleData = vehicleData;

  });

  //This section call the service to fetch the list of product locations
  getProductLocations.fetchData().then(function(response) {
    var productLocations = response.data.result;
    pickUpLocationList = getProductLocationByType(0, productLocations);
    dropOffLocationList = getProductLocationByType(1, productLocations);
    $scope.pickUpL = pickUpLocationList;
    $scope.dropOff = dropOffLocationList;
    updateLocationPrice(pickUpLocationList, timeSettings.startTime);
    updateLocationPrice(dropOffLocationList, timeSettings.endTime);


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
    var startDate = timeSettings.startDate + " " + timeSettings.startTime;
    var endDate = timeSettings.endDate + " " + timeSettings.endTime;
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate, endDate).then(function(response) {
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
    var startDate = timeSettings.startDate + " " + startTime;
    var endDate = timeSettings.endDate + " " + timeSettings.endTime;
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate, endDate).then(function(response) {
      if (response.data.result > 0)
        $scope.rentalPrice = response.data.result;
      timeSettings.startTime = startTime;

      //Check we should charche an extra day and show the message
      showDayExtraMessage(timeSettings.startTime, timeSettings.endTime);

      // update the price of the locations
      updateLocationPrice(pickUpLocationList, timeSettings.startTime);
      updateLocationPrice(dropOffLocationList, timeSettings.endTime);


    });
  });

  $('#timepicker2').timepicker().on('hide.timepicker', function(e) {
    var endTime = e.time.value + ":00";
    var startDate = timeSettings.startDate + " " + timeSettings.startTime;
    var endDate = timeSettings.endDate + " " + endTime;
    //This section call the service to fetch the price for each product
    getPriceForProduct.fetchData(startDate, endDate).then(function(response) {
      if (response.data.result > 0)
        $scope.rentalPrice = response.data.result;
      timeSettings.endTime = endTime;
      showDayExtraMessage(timeSettings.startTime, timeSettings.endTime);

      // update the price of the locations
      updateLocationPrice(pickUpLocationList, timeSettings.startTime);
      updateLocationPrice(dropOffLocationList, timeSettings.endTime);


    });
  });


  /***** Helper functions ********/

  showDayExtraMessage = function(timeStart, timeEnd) {
    var same = moment(timeSettings.startDate, 'DD/MM/YYYY').isSame(moment(timeSettings.endDate, 'DD/MM/YYYY'));
    if (!same) {
      $scope.showExtraDayMessage = moment(timeStart, "HH:mm:ss").isBefore(moment(timeEnd, "HH:mm:ss"));

    }
  }

  //this function separate the location by type in two list accordinly
  getProductLocationByType = function(type, products) {
    var list;
    list = [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].type === type && products[i].code !== "<ALL>") {
        //insert a new key in the object to display the price
        products[i].showPrice = 0;
        list.push(products[i]);

      }
    }
    return list;
  }

  //update the location price show in the dropdown
  updateLocationPrice = function(list, time) {
    //list,time,indexList
    for (var i = 0; i < list.length; i++) {
      getPriceForLocationId(list, time, i);
    }

  }

  //calculate the total location price Start location plus End location
  calculateLocationPrice = function() {
    //check if the location of the pickup is seleted
    if (DropDownSelected.pickUpLocation.selected) {
      //find the rigth price and update the showPrice of the list
      for (var i = 0; i < pickUpLocationList.length; i++) {
        if (pickUpLocationList[i].id === DropDownSelected.pickUpLocation.id) {

          DropDownSelected.pickUpLocation.price = pickUpLocationList[i].showPrice;
        }
      }
    }
    //check if the location of the pickup is seleted
    if (DropDownSelected.dropOffLocation.selected) {
      //find the rigth price and update the showPrice of the list
      for (var i = 0; i < dropOffLocationList.length; i++) {
        if (dropOffLocationList[i].id === DropDownSelected.dropOffLocation.id) {
          DropDownSelected.dropOffLocation.price = dropOffLocationList[i].showPrice;
        }
      }
    }
    //add the two prices of the selected locations
    $scope.locationPrice = DropDownSelected.pickUpLocation.price +
      DropDownSelected.dropOffLocation.price;

  }

  //update each price of the items in the dropDowns
  getPriceForLocationId = function(list, time, indexList) {
    const endPoint = "GetPriceForLocation";
    var data, promise;
    data = {
      id: list[indexList].id,
      time: time,
      token: apiInfo.token,
      useOutsideOfficeHoursPrice: list[indexList].isAvailableOutsideOfficeHours
    }
    promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    promise.then(function(response) {
      list[indexList].showPrice = response.data.result;
      //recalculate the price after update
      calculateLocationPrice();
    })
  }


  $scope.displayList = function(contentId) {
    /*when the user click on the select,
    toggle between hiding and showing the dropdown content */
    if (DropDownSelected.dropDownActive.id ==="") {
      DropDownSelected.dropDownActive.id = contentId;
      DropDownSelected.dropDownActive.active = true;
      var drop = document.getElementById(contentId);
      drop.classList.add("show");
    } else if(DropDownSelected.dropDownActive.id === contentId && DropDownSelected.dropDownActive.active) {
      var drop = document.getElementById(contentId);
      drop.classList.remove("show");
      DropDownSelected.dropDownActive.active = false;
    } else if(DropDownSelected.dropDownActive.id === contentId && !DropDownSelected.dropDownActive.active) {
      var drop = document.getElementById(contentId);
      drop.classList.add("show");
      DropDownSelected.dropDownActive.active = true;
    } else if (DropDownSelected.dropDownActive.id !== contentId && !DropDownSelected.dropDownActive.active) {
        DropDownSelected.dropDownActive.id = contentId;
        DropDownSelected.dropDownActive.active = true;
        var drop = document.getElementById(contentId);
        drop.classList.add("show");
    } else if (DropDownSelected.dropDownActive.id !== contentId && DropDownSelected.dropDownActive.active) {
        document.getElementById(DropDownSelected.dropDownActive.id).classList.remove("show");
        DropDownSelected.dropDownActive.id = contentId;
        DropDownSelected.dropDownActive.active = true;
        var drop = document.getElementById(contentId);
        drop.classList.add("show");
    }

    //var drop = document.getElementById(contentId);
    //drop.classList.toggle("show");
    //drop.classList.toggle("dropActive");
    //document.getElementById(contentId).classList.add("dropActive");
  }

  //after click event in the dropDown call this function
  $scope.selectLocation = function(id, price, code, type) {
    if (type === 0) {
      DropDownSelected.pickUpLocation.id = id;
      DropDownSelected.pickUpLocation.code = code;
      DropDownSelected.pickUpLocation.price = price;
      DropDownSelected.pickUpLocation.selected = true;
       var element = document.querySelector("#pickUpTxt");
       element.textContent=code;

    } else {
      DropDownSelected.dropOffLocation.id = id;
      DropDownSelected.dropOffLocation.code = code;
      DropDownSelected.dropOffLocation.price = price;
      DropDownSelected.dropOffLocation.selected = true;
      var element = document.querySelector("#dropOffTxt");
      element.textContent=code;
    }

    //recalculate the price of the location
    calculateLocationPrice();



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
    productId: productId,
    token: apiInfo.token
  }
  const endPoint = "GetProductLocations";
  this.fetchData = function() {
    var promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    return promise;
  }

});

//Service GetPriceForLocation
Product.service('getPriceForLocation', function($http) {

  const endPoint = "GetPriceForLocation";
  this.fetchData = function(list, time, indexList) {
    var data, promise;
    data = {
      id: list[indexList].id,
      time: time,
      token: apiInfo.token,
      useOutsideOfficeHoursPrice: list[indexList].isAvailableOutsideOfficeHours
    }
    promise = $http.post(apiInfo.proxyUrl + apiInfo.url + endPoint, JSON.stringify(data));
    promise.then(function(response) {
      list[indexList].showPrice = response.data.result;

    })

  }
})

//Service GetPriceLocation
Product.service('getPriceForProduct', function($http) {
  //product id variable
  var productId = $.urlParam('product');
  //set a default product to economy
  if (!productId) {
    productId = 1;
  }

  const endPoint = "GetPriceForProduct";
  this.fetchData = function(startDate, endDate) {
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
