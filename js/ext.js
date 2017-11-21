export default
const tonken = {
  token: '545b4c10-b193-4274-9531-afb589c548cd';
}

var s = {
    "X-GeysirApiKey": '{"UserName" : "Geysir", "Token" : "545b4c10-b193-4274-9531-afb589c548cd"}'
  },
  c = "/hub/api/json/reply/" + e;
t['token'] = "545b4c10-b193-4274-9531-afb589c548cd";

$.ajax({
  type: "POST",
  url: c,
  dataType: "json",
  contentType: "application/json",
  crossDomain: !0,
  headers: s,
  data: JSON.stringify(t),
  success: n,
  error: function(s, c, u) {
    500 == s.status && 5 > a && i.delay(r, 100, e, t, n, o, a + 1), "function" == typeof o && o(s, c, u)
  }
})
}
var i = n(14);
e.exports = r
},
function(e, t) {
  function n(e) {
    return !!e && "object" == typeof e
  }
  e.exports = n
},
function(e, t, n) {
  "use strict";

  function r(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
  }
  var i, o = function() {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
      }
      return function(t, n, r) {
          return n && e(t.prototype, n), r && e(t, r),
