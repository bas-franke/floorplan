FLOORPLAN.Settings = function(args, colors, elementIDs) {
  _.extend(this, {
    // 4096, 2048, 1024, 256
    debug: false,
    svgWidth: 0, // 0 = auto
    svgHeight: 0, // 0 = auto
    containerWidth: 500,
    containerHeight: 500,
    smallmenu: true,
    largemenu: false,
    arrowSize: 120,
    enabledMeasurements: true,
    enabledArrows: true,
    integratedMode: false
  }, args);

  this.colors = {};
  _.extend(this.colors, {
    primary: '#000',
    secondary: '#eee',
    tertiary: '#ddd'
  }, colors);

  this.elementIDs = {};
  _.extend(this.elementIDs, {
    debug: 'debug',
    container: 'floorplan-container',
    SVG: 'svg',
    SVGContainer: 'svgContainer',
    SVGOverlay: 'overlay',
    SVGStoreys: 'storeys',
    SVGSelector: 'selector',
    SVGGrabber: 'grabber',
    SVGRecenter: 'recenter',
    XMLFilename: 'rijksstraatweg',
    INFOSelected: 'info-selected',
    INFOHover: 'info-hover',
    Menu: 'sidemenu',
    pointer: 'pointer',
    pointerHover: 'pointer-hover',
    pointerContainer: 'pointer-container'
  }, elementIDs)

  this.init();
}

FLOORPLAN.Settings.prototype = {
  init: function() {
    this.containerHeight = '100%';
    this.containerWidth = '100%';
    if(!this.debug) {
      $("#" + this.elementIDs.debug).hide();
    }
  },

}
