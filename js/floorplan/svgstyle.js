FLOORPLAN.SVGStyle = function(args) {
  _.extend(this, {
    elementSVG: null,
    settings: null
  }, args);

  this.init();
};

FLOORPLAN.SVGStyle.prototype = {
  init: function() {
    $('text', this.elementSVG).attr('unselectable', 'on')
      .css({
        '-moz-user-select': '-moz-none',
        '-moz-user-select': 'none',
        '-o-user-select': 'none',
        '-khtml-user-select': 'none',
        /* you could also put this in a class */
        '-webkit-user-select': 'none',
        /* and add the CSS class here instead */
        '-ms-user-select': 'none',
        'user-select': 'none'
      }).bind('selectstart', function() {
        return false;
      });
    $('text', this.elementSVG).css('cursor', 'pointer');
    $('text', this.elementSVG).css('stroke-opacity', '0.3');
    $('path', this.elementSVG).css('stroke-width', '2');

    $('text', this.elementSVG).attr('transform', 'scale(-1, 1)');

		$('#pointer').css('font-size', this.settings.arrowSize + 'px');
		$('#pointer-hover').css('font-size', this.settings.arrowSize + 'px');
  }
}
