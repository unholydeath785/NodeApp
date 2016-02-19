var jsonfile = require('jsonfile');
var request = require('request');
//Data structures

var lithiumApp = (function ($) {
  //variables

  //functions
  var ignition = function () {
    console.log("running");
  }

  //return
  return {
    start: ignition
  };

})(jQuery);

$(document).ready(function () {
  lithiumApp.start();
});
