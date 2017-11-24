$.urlParam = function(name){
var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
if (results == null){
  return false
}
return results[1] || 0;
}



// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!(event.target.matches('.dwn__select-default') || event.target.matches('.icon') || event.target.matches('.locTxt') || event.target.matches('.dwn__select-btn'))) {

    var dropdowns = document.getElementsByClassName("dwn__select-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }

    }


  }
}

/*window.onclick = function(event) {
  console.log(event.target)
  if (event.target.matches('.dropActive')) {

    var dropdowns = document.getElementsByClassName("dwn__select-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}*/
