FLOORPLAN.Camera = function(args) {
  _.extend(this, {
    id: 0,
    settings: null,
    SVG: null,
    SVGContainer: null,
    sectioningValue: 0,
    x: 0,
    y: 0,
    xRot: 0,
    yRot: 0,
    angle: 0,
    xScale: 1,
    yScale: 1,
    maxScale: 2,
    minScale: 0.05,
    overlay: '',
    container: '',
    pointerContainer: null,
    selectorC: null,
    prevPosX: 0,
    prevZoompointX: 0,
    prevZoompointY: 0,
    topBound: -100000,
    bottomBound: 100000,
    leftBound: -100000,
    rightBound: 100000,
    sectioning: 0,
    scaleSpeedModifier: 0.1,
    mobileCursorPadding: 30
  }, args);

  this.maxScale *= 2048 / this.settings.svgWidth;

  var elementIDs = this.settings.elementIDs;
  this.SVGContainer = elementIDs.SVGContainer;
  this.container = $('#' + elementIDs.container);
  this.overlay = $('#' + elementIDs.SVGOverlay);
  this.pointerContainer = elementIDs.pointerContainer;

  this.svgEle = document.getElementById(this.settings.elementIDs.SVG);
  this.pointerContainerEle = document.getElementById(this.pointerContainer);
  this.st = window.getComputedStyle(this.svgEle, null);

  this.init();
  this.initEvents();
  this.initMobile();
};

FLOORPLAN.Camera.prototype = {
  init: function() {
    var self = this;
    this.containerOffsetX = $('.floorplan').parent().offset().left;
    this.containerOffsetY = $('.floorplan').parent().offset().top;

    this.storeyYOffset = (this.settings.newHeight - this.settings.initialHeight) / 2;
    this.storeyXOffset = (this.settings.initialWidth) / 2;
    this.offsetPercentage = this.settings.newHeight / this.settings.initialHeight;

    var widthCenter = this.settings.svgWidth / 2;
    var heightCenter = this.settings.svgHeight / 2;

    $('.storey', this.elementSVG).css('transform-origin', widthCenter + 'px ' + heightCenter + 'px');
    $('#svg').css('transform-origin', 'top left');
    $('#svg', this.elementSVG).css('-ms-transform-origin', widthCenter + 'px ' + heightCenter + 'px');
    $('#pointer-container').css('transform-origin', 'top left');
    $('#pointer-container').css('-moz-transform-origin', 'top left');


    // Calculate the padding for
    this.svgPadding = $('#svg').height() - this.settings.svgHeight;
    this.maxStoreyHeight = -1;
    $('.storey', this.elementSVG).each(function() {
        var h = $(this)[0].getBoundingClientRect().height;
        self.maxStoreyHeight = h > self.maxStoreyHeight ? h : self.maxStoreyHeight;
        console.log(h + ':' + self.maxStoreyHeight);
    });
    console.log(self.maxStoreyHeight);


    this.centerSVG();
    this.refresh();
    this.originalX = this.x;
    this.refreshStoreys();
  },


  initMobile: function() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.initMobileEvents();
      this.scaleSpeedModifier = 0.2;
      addEventListener("click", function() {
        var el = document.documentElement
        , rfs =
               el.requestFullScreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
        ;
        rfs.call(el);
      });
    }
  },


  initEvents: function() {
    var self = this;
    var elementIDs = this.settings.elementIDs;

    $(window).resize(function() {
      self.centerSVG();
      self.refresh();
    });

    $('#slider').on('input', function() {
      self.sectioningValue = $(this).val();
      self.refresh();
      self.refreshStoreys();
    });


    // Recenter
    $('#' + elementIDs.SVGRecenter).bind("click", function() {
      self.centerSVG();
      self.refresh();
    });

    var cursorStartX, cursorStartY, currentX, currentY;
    this.isDragging = false;
    this.overlay
    .mousedown(function(event) {
      switch (event.which) {
        case 1:
          self.isDragging = true;
          self.cursorStartX = event.pageX;
          self.cursorStartY = event.pageY;
          break;
        case 3:
          self.isRotating = true;
          self.startX = event.pageX;
          self.startY = event.pageY;
          break;
      }
    })
    this.overlay.mousemove(function(event) {
      if(self.isDragging) {
        self.move(event.pageX, event.pageY);
      }
      // Rotate
      if (self.isRotating) {
        self.rotate(event.pageX, event.pageY);
      }
    })
    this.overlay.mouseup(function() {
      self.isDragging = false;
      self.isRotating = false;
    });

    // ZOOM
    this.overlay.bind('mousewheel MozMousePixelScroll DOMMouseScroll', function(event) {
      //event.preventDefault();
      //x = (window.event) ? window.event.pageX : event.clientX;
      //y = (window.event) ? window.event.pageY : event.clientY;

  		//e = window.event ? window.event : e;
      //event.originalEvent.clientX
      x = (event.pageX) ?  event.pageX : event.originalEvent.clientX;
      y = (event.pageY) ?  event.pageY : event.originalEvent.clientY;
      if (event.originalEvent.wheelDelta >= 0 || event.originalEvent.detail < 0) {
        // ZOOM IN (scroll up)
        self.zoomIn(x, y);
      } else {
        // ZOOM OUT(scroll down)
        self.zoomOut(x, y);
      }
      self.zoomEnd();
    });

  },


  initMobileEvents: function() {
    var self = this;

    $('#overlay').on('touchstart', function(e) {
      if (e.originalEvent.touches.length == 1) {
        self.isDragging = true;
        self.cursorStartX = e.originalEvent.touches[0].pageX;
        self.cursorStartY = e.originalEvent.touches[0].pageY;
      }

      if (e.originalEvent.touches.length == 2) {
        self.startX = e.originalEvent.touches[1].pageX;
        self.startY = e.originalEvent.touches[1].pageY;
      }
    });

    $('#overlay').on('touchmove', function(e){
      e.preventDefault();
      self.move(e.originalEvent.touches[0].pageX,  e.originalEvent.touches[0].pageY);

      if (e.originalEvent.touches.length == 2) {
        // Zoom
        if ((self.startX - e.originalEvent.touches[1].pageX) > self.mobileCursorPadding || (self.startX - e.originalEvent.touches[1].pageX) < -self.mobileCursorPadding) {
          if ((self.startX - e.originalEvent.touches[1].pageX) > self.mobileCursorPadding) {
            self.zoomIn(e.originalEvent.touches[0].pageX,  e.originalEvent.touches[0].pageY);
          } else if ((self.startX - e.originalEvent.touches[1].pageX) < -self.mobileCursorPadding) {
            self.zoomOut(e.originalEvent.touches[0].pageX,  e.originalEvent.touches[0].pageY);
          }
          self.zoomEnd();
        }

        // Rotate
        if ((self.startY - e.originalEvent.touches[1].pageY) > self.mobileCursorPadding || (self.startY - e.originalEvent.touches[1].pageY) < -self.mobileCursorPadding) {
          $('#debug').html("[" +self.x + ", " + self.y + "] Angle(" + self.angle + ")");
          if ((self.startY - e.originalEvent.touches[1].pageY) > self.mobileCursorPadding) {
            self.rotate(e.originalEvent.touches[1].pageX,  e.originalEvent.touches[1].pageY);
          } else if ((self.startY - e.originalEvent.touches[1].pageY) < -self.mobileCursorPadding) {
            self.rotate(e.originalEvent.touches[1].pageX,  e.originalEvent.touches[1].pageY);
          }
        }
      }
    });

    $('#overlay').on('touchend', function(e) {

    });
  },


  zoomIn: function (x, y) {
    var self = this;

    var scaleSpeed = self.xScale * self.scaleSpeedModifier;

    // Calculate relative x and y mouse point.
    var pageX = x - self.containerOffsetX;
    var pageY = y - self.containerOffsetY;

    var posX = self.x - x;
    var relX = posX * (self.xScale - 1) - 200;
    if (self.yScale < self.maxScale) {
      self.xScale += scaleSpeed;
      self.yScale += scaleSpeed;

      self.prevZoompointX = self.calcZoompoint(scaleSpeed, self.x, pageX, self.prevZoompointX, self.xScale);
      var zoompointX = self.calcZoompoint(scaleSpeed, self.x, pageX, self.prevZoompointX, self.xScale);

      self.prevZoompointY = self.calcZoompoint(scaleSpeed, self.y, pageY, -self.prevZoompointY, self.yScale);
      var zoompointY = self.calcZoompoint(scaleSpeed, self.y, pageY, self.prevZoompointY, self.yScale);

      self.x += zoompointX;
      self.y += zoompointY;
    }
  },


  zoomOut: function(x, y) {
    var self = this;

    var scaleSpeed = self.xScale * self.scaleSpeedModifier;

    // Calculate relative x and y mouse point.
    var pageX = x - self.containerOffsetX;
    var pageY = y - self.containerOffsetY;

    var posX = self.x - x;
    var relX = posX * (self.xScale - 1) - 200;

    if (self.yScale > self.minScale) {
      self.xScale -= scaleSpeed;
      self.yScale -= scaleSpeed;

      // Set zoompoint
      self.prevZoompointX = self.calcZoompoint(scaleSpeed, self.x, pageX, -self.prevZoompointX, self.xScale);
      var zoompointX = self.calcZoompoint(scaleSpeed, self.x, pageX, -self.prevZoompointX, self.xScale);

      self.prevZoompointY = self.calcZoompoint(scaleSpeed, self.y, pageY, self.prevZoompointY, self.yScale);
      var zoompointY = self.calcZoompoint(scaleSpeed, self.y, pageY, -self.prevZoompointY, self.yScale);

      self.x -= zoompointX;
      self.y -= zoompointY;
    }
  },


  zoomEnd: function() {
    var self = this;
    self.calculateBounds();
    if (self.x < self.leftBound) {
      self.x = self.leftBound;
    }
    self.refresh();
  },


  calcZoompoint: function(scaleSpeed, viewX, mouseX, initialPoint, xScale) {
    var posX = (viewX - mouseX) + initialPoint;
    var test = (1 / xScale) / (1 / scaleSpeed);
    var zoompoint = posX * test;
    this.updatePathWidth();
    return zoompoint;
  },


  refresh: function() {
    var transform = 'matrix(' + this.xScale + ', ' + this.xRot + ', ' + this.yRot + ', ' + this.yScale + ', ' + this.x + ', ' + this.y + ') rotate(0deg) ';
    this.pointerContainerEle.style.transform = transform;
    this.svgEle.style.transform = transform;
    if (this.selectorC.hasSelected) {
      this.selectorC.updateArrow();
    }
  },


  refreshStoreys: function() {
    var self = this;
    var section = 0;
    $('.storey', this.elementSVG).each(function() {
      var width = self.settings.svgWidth;
      var sectioning = section * (((width + (width / 3)) / 100) * self.sectioningValue);
      sectioning += self.storeyXOffset;
      if ($(this).css('display') != 'none') {
        section++;
      }
      self.sectioning = sectioning + self.storeyYOffset;
      //console.log('length : ' + (self.sectioning * self.xScale));
      var transform = 'matrix(-1, 0, 0, 1, ' + sectioning + ', ' + self.storeyYOffset + ') rotate(' + self.angle + 'deg)';
      $(this).css('transform', transform);
    });

    self.calculateBounds();

  },


  move: function(x, y) {
    var self = this;
    var currentX = x;
    var currentY = y;

    if (self.isDragging == true) {
      var changeX = currentX - self.cursorStartX;
      var changeY = currentY - self.cursorStartY;

      if (!(changeX < 0 && self.x < self.leftBound) && !(changeX > 0 && self.x > self.rightBound)) {
        self.x += changeX;
      }
      if (!(changeY < 0 && self.y < self.topBound) && !(changeY > 0 && self.y > self.bottomBound)) {
        self.y += changeY;
      }
      self.cursorStartX = currentX;
      self.cursorStartY = currentY;

      self.refresh();
    }
  },


  rotate: function(x, y) {
    var self = this;

    var currentY = y;

    self.angle -= (currentY - self.startY) / 2;
    self.startY = currentY;
    self.refreshStoreys();
    self.refresh();
  },


  centerSVG: function() {
    this.height = $('.floorplan object').height();
    this.width = $('.floorplan object').width();

    $('#' + this.SVGContainer).css('height', this.settings.containerHeight);
    $('#' + this.SVGContainer).css('width', this.settings.containerWidth);
    this.containerWidth = Number($('#' + this.SVGContainer).css('width').replace('px', ''));
    this.containerHeight = Number($('#' + this.SVGContainer).css('height').replace('px', ''));

    // Calculate scale and x/y coordinates for current container resolution
    this.difference = this.containerWidth - this.containerHeight;
    var adjustY = 0,
    adjustX = 0;

    // Set correct position on Larger Height
    /*if (this.containerHeight > this.containerWidth) {
      this.xScale = -1 * (this.containerWidth / this.width);
      this.yScale = this.containerWidth / this.width;
      adjustY -= (this.difference / 2);
      // Set correct position on Larger Width
    } else {*/
      this.xScale = 1 * ((this.containerHeight * this.offsetPercentage) / (this.maxStoreyHeight + this.svgPadding));
      this.yScale = (this.containerHeight * this.offsetPercentage) / (this.maxStoreyHeight + this.svgPadding);
      adjustX += (this.difference / 2);
    //}

    // Remove offsets from storeys
    adjustX -= this.storeyXOffset * this.xScale;
    adjustY -= this.storeyYOffset * this.yScale;

    this.x = adjustX;
    this.y = adjustY;
    this.updatePathWidth();
    this.calculateBounds();
  },


  getMatrix: function() {
    this.tr = this.st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform");
    return this.tr;
  },


  updatePathWidth: function() {
    var self = this;
    $('path', this.elementSVG).css('stroke-width', ((1 / self.xScale) / 2));
  },


  calculateBounds: function() {
    this.topBound = (this.yScale * $('#svg').height()) * -1;

    this.bottomBound = this.container.height();

    this.rightBound = this.container.width();

    this.leftBound = -1 * ((this.sectioning + (this.settings.svgWidth / 3) + this.storeyXOffset) * this.xScale);
  }
}
