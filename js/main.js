$(document).ready(function() {
  var settings = new FLOORPLAN.Settings({
    smallmenu: false
  }, {
    primary: '#f92672',
    secondary: '#aaaaff',
    tertiary: '0000ff'
  });
  var XMLFilename = document.getElementById('svg').getAttribute('data');
  XMLFilename = XMLFilename.substr(XMLFilename.indexOf('/') + 1, XMLFilename.length);
  XMLFilename = XMLFilename.substr(0, XMLFilename.indexOf('.'));

  var app = new FLOORPLAN.Application({
    XMLFilename: XMLFilename
  });
  app.settings = settings;
  app.floorplan();


  /*var app2 = new FLOORPLAN.Application({
});
app2.settings = settings;
app2.floorplan();*/

});
/*
(function () {
    "use strict";
    //var init();
    var init = function(){
        document.getElementById('svg').addEventListener("load", function() {
            console.log('test!!!');
        });
    }
    init();
})();
*/
