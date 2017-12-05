var Product = angular.module('Product', ['ui.select','ngSanitize','ngResource']);
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
  getProductLocations, getPriceForLocation,
  calculateRentalTotal
) {
  var now, timeSettings, vehicleData,
    pickUpLocationList, dropOffLocationList,
    DropDownSelected, extras, totalDays, driverInfo, countriesList;
  now = moment();
  countriesList  = [
           "Select your country","Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"
      ];
  var counter = 0;
  timeSettings = {
    startDate: now.format('DD/MM/YYYY'),
    endDate: now.format('DD/MM/YYYY'),
    startTime: "00:00:00",
    endTime: "00:00:00",
    totalDays:0
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
  extras = [];
  //store information about the drivers
  driverInfo = [
    {
      id:"default",
      firstName:"",
      lastName:"",
      license:"",
      country:"",
      isShowing:false,
      eraseButton:false
    }
  ]
  $scope.pickUpL = pickUpLocationList;
  $scope.dropOff = dropOffLocationList;
  $scope.rentalPrice = 0;
  $scope.locationPrice = 0;
  $scope.extrasPrice = 0;
  $scope.rentalTotal = 0;
  $scope.driverInfo = driverInfo;
  $scope.countries = countriesList;
  $scope.selectedCountry = $scope.countries[0];


  getVehicleByIdSvc.fetchData().then(function(response) {
    vehicleData = response.data.result;
    for (var i = 0; i < vehicleData.extras.length; i++) {
        vehicleData.extras[i].showPrice = vehicleData.extras[i].price;
        vehicleData.extras[i].totalPrice = 0;
        if(vehicleData.extras[i].isMultiple) {
            vehicleData.extras[i].extrasStates = {initialState:true,calculateState:false};
        }else {
          vehicleData.extras[i].checked = false;
        }
          extras.push(vehicleData.extras[i]);
    }
    $scope.extras = extras;

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
      //calculate rental total
      $scope.rentalTotal = calculateRentalTotal.
      calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);
      });
      //we need to keep track of the total of the extras if the user
      //chanche the dates
      recalculateTotalExtras();



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
      //calculate rental total
      $scope.rentalTotal = calculateRentalTotal.
      calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);
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
      recalculateTotalExtras();
      //calculate rental total
      $scope.rentalTotal = calculateRentalTotal.
      calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);
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

  }

  $scope.showDriverDetailsForm = function (driverId) {
    var driver;
    for (var i = 0; i < driverInfo.length; i++) {
      if(driverInfo[i].id === driverId) {
        driver = driverInfo[i];
        break;
      }
    }
    driver.isShowing = (driver.isShowing)?false:true;

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
    //calculate rental total
    $scope.rentalTotal = calculateRentalTotal.
    calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);
  }
  //add one to the item
  $scope.addToMultipleExtra = function (id) {
      var extra,getTotalDay,TotalDays,state;

      getTotalDay = calculateTotalDays();
      totalDays = (getTotalDay < 1) ? 1 : getTotalDay;
      for (var i = 0; i < extras.length; i++) {
        if(extras[i].id === id) {
          extra = extras[i];
        }
      }
      if (extra.extrasStates.initialState) {
          extra.amount++;
          //extra.selected = true;
          extra.showPrice = extra.amount * extra.price;
          extra.totalPrice = extra.showPrice;
          document.getElementById("price-"+id)
          .classList.add("removeLine");
          if (extra.type === "PerDay") {
            extra.totalPrice = (extra.showPrice * totalDays);
          }
          extra.extrasStates.initialState = false;
          extra.extrasStates.calculateState = true;
          //Check if is extra driver and add an object to the array
          if (extra.isExtraDriver) {
              driverInfo.push({
                id:"driver-"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                firstName:"",
                lastName:"",
                license:"",
                country:"",
                isShowing:false,
                eraseButton:true,
                extrasId:extra.id
              })
          }
      } else if (extra.extrasStates.calculateState) {
          extra.amount++;
          extra.showPrice = extra.amount * extra.price;
          extra.totalPrice = extra.showPrice;
          if (extra.type === "PerDay") {
            extra.totalPrice = (extra.showPrice * totalDays);
          }
          if (extra.isExtraDriver) {
              driverInfo.push({
                id:"driver-"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                firstName:"",
                lastName:"",
                license:"",
                country:"",
                isShowing:false,
                eraseButton:true,
                extrasId:extra.id
              })
          }
        }

        //Calculate the total price for the extras
        var total = 0;
        for (var i = 0; i < extras.length; i++) {
            //the sum of all the totals of the extras
            total = total + extras[i].totalPrice;
        }
        $scope.extrasPrice = total;
        //calculate rental total
        $scope.rentalTotal = calculateRentalTotal.
        calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);


  }



  $scope.removeToMultipleExtras = function (id) {
    var extra,getTotalDay,TotalDays,state;

    getTotalDay = calculateTotalDays();
    totalDays = (getTotalDay < 1) ? 1 : getTotalDay;
    for (var i = 0; i < extras.length; i++) {
      if(extras[i].id === id) {
        extra = extras[i];
      }
    }
    if (extra.extrasStates.calculateState) {
        if (extra.amount > 0) {
            extra.amount--
            extra.showPrice = extra.amount * extra.price;
            extra.totalPrice = extra.showPrice;
            if (extra.type === "PerDay") {
              if(extra.amount > 0){
                  extra.totalPrice = (extra.showPrice * totalDays);
              }
            }
            if (extra.isExtraDriver) {
                if (driverInfo.length > 1) {
                    driverInfo.pop();
                  }
                }

            if(extra.amount < 1) {
              document.getElementById("price-"+id)
              .classList.remove("removeLine");
              extra.showPrice = extra.price;
              extra.totalPrice = 0;
              extra.extrasStates.initialState = true;
              extra.extrasStates.calculateState = false;

            }
        }
    }
    //Calculate the total price for the extras
    var total = 0;
    for (var i = 0; i < extras.length; i++) {
        //the sum of all the totals of the extras
        total = total + extras[i].totalPrice;
    }
    $scope.extrasPrice = total;
    //calculate rental total
    $scope.rentalTotal = calculateRentalTotal.
    calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);

  }

  $scope.removeExtraDriver = function(driverId) {
      var extrasId,extra,getTotalDay,TotalDays,state;
      for (var i = 0; i < driverInfo.length; i++) {
        if (driverInfo[i].id === driverId) {
            extrasId = driverInfo[i].extrasId;
            driverInfo.splice(i, 1);
            break;
        }
      }
      /*I will refactor the whole thing Im repiting myself all over the place
        Here down is just a copy paste from the function removeToMultipleExtras
        And what it does is to substract the amount of the extra and recalculate the prices
      */
      getTotalDay = calculateTotalDays();
      totalDays = (getTotalDay < 1) ? 1 : getTotalDay;
      for (var i = 0; i < extras.length; i++) {
        if(extras[i].id === extrasId) {
          extra = extras[i];
        }
      }
      if (extra.extrasStates.calculateState) {
          if (extra.amount > 0) {
              extra.amount--
              extra.showPrice = extra.amount * extra.price;
              extra.totalPrice = extra.showPrice;
              if (extra.type === "PerDay") {
                if(extra.amount > 0){
                    extra.totalPrice = (extra.showPrice * totalDays);
                }
              }
              if(extra.amount < 1) {
                document.getElementById("price-"+extrasId)
                .classList.remove("removeLine");
                extra.showPrice = extra.price;
                extra.totalPrice = 0;
                extra.extrasStates.initialState = true;
                extra.extrasStates.calculateState = false;

              }
          }
      }
      //Calculate the total price for the extras
      var total = 0;
      for (var i = 0; i < extras.length; i++) {
          //the sum of all the totals of the extras
          total = total + extras[i].totalPrice;
      }
      $scope.extrasPrice = total;
      //calculate rental total
      $scope.rentalTotal = calculateRentalTotal.
      calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);


  }

  //Checkbox Selection in extras
$scope.checkBoxExtra = function(id) {
  var extra,getTotalDay,TotalDays;
  getTotalDay = calculateTotalDays();
  totalDays = (getTotalDay < 1) ? 1 : getTotalDay;
  for (var i = 0; i < extras.length; i++) {
    if(extras[i].id === id) {
      extra = extras[i];
    }
  }

  if (!extra.checked) {
    extra.checked = true;
    document.getElementById("price-"+id).classList.add("removeLine");
    extra.totalPrie = extra.showPrice;
    if (extra.type === "PerDay") {
        extra.totalPrice = (extra.showPrice * totalDays);
    }


  } else {
     // the checkbox is currently checked and is being uncheck
     document.getElementById("price-"+id).classList.remove("removeLine");
     extra.totalPrice = 0;
     extra.checked = false;

  }
  //Calculate the total price for the extras
  var total = 0;
  for (var i = 0; i < extras.length; i++) {
      //the sum of all the totals of the extras
      total = total + extras[i].totalPrice;
  }
  $scope.extrasPrice = total;
  //calculate rental total
  $scope.rentalTotal = calculateRentalTotal.
  calculeTotal($scope.rentalPrice,$scope.locationPrice,$scope.extrasPrice);
}

//function helper that identify if we remove a driver from the extras form of from the driver details form
helpingRemoveExtrasAndExtraDriver = function(extra,type){

}
//we need this function to calculate everytime a date or a time change
recalculateTotalExtras = function()
{
  var getTotalDay,TotalDays,total;
  total = 0;
  getTotalDay = calculateTotalDays();
  totalDays = (getTotalDay < 1) ? 1 : getTotalDay;
  for (var i = 0; i < extras.length; i++) {
      //We need to check only those extras selected by the user
      if (extras[i].totalPrice > 0) {
        //we update the prices
        if (extras[i].type === "PerDay") {
            extras[i].totalPrice = (extras[i].showPrice * totalDays);
        } else {
          extras[i].totalPrice = extras[i].showPrice;
        }
      }
      //We recalculate the total
      total = total + extras[i].totalPrice;
  }
  $scope.extrasPrice = total;

}

  //Calculate the total days of the rental
  calculateTotalDays = function (){
    let {
       startDate,
       endDate,
       startTime,
       endTime,
       totalDays
     } = timeSettings;
    var pickUpDay, dropOffDay,pickUpDayFormatted,dropOffDayFormatted,duration;
    //pickUpDay = startDate+" "+startTime;
    //dropOffDay = endDate+" "+endTime;
    pickUpDay = startDate;
    dropOffDay = endDate;
    //pickUpDayFormatted = moment(pickUpDay, 'DD/MM/YYYY HH:mm:ss');
    //dropOffDayFormatted = moment(dropOffDay, 'DD/MM/YYYY HH:mm:ss');
    pickUpDayFormatted = moment(pickUpDay, 'DD/MM/YYYY');
    dropOffDayFormatted = moment(dropOffDay, 'DD/MM/YYYY');
    duration = moment.duration(dropOffDayFormatted.diff(pickUpDayFormatted));
    var diffDays = duration.asDays();
    totalDays = diffDays;
    var same = moment(pickUpDayFormatted, 'DD/MM/YYYY').isSame(moment(dropOffDayFormatted, 'DD/MM/YYYY'));
    if (!same) {
      var extraday = moment(startTime, "HH:mm:ss").isBefore(moment(endTime, "HH:mm:ss"));
      if (extraday) {
        totalDays = totalDays+1;
      }
    }
    return totalDays;
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

//Service calculate the grand total
Product.service('calculateRentalTotal', function($http){
  var total;
  this.calculeTotal = function (rentalPrice,locationPrice, extrasPrice)
  {
    total = rentalPrice + locationPrice + extrasPrice;

    return total;
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
