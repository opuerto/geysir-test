//function helper for get the parameters from the url
$.urlParam = function(name){
var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
if (results == null){
  return false
}
return results[1] || 0;
}
