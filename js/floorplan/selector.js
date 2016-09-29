FLOORPLAN.Selector = function(args) {
  _.extend(this, {
    elementSVG: null,
    SVGOverlay: null,
    SVGSelector: null,
    SVGGrabber: null,
    xmlreader: null,
    INFOSelected: null,
    INFOHover: null,
    pointer: null,
    settings: null,
    bounds: null,
    selectedElement: null,
    hasSelected: false
  }, args);

  var elementIDs = this.settings.elementIDs;
  this.SVGOverlay = elementIDs.SVGOverlay;
  this.SVGSelector = elementIDs.SVGSelector;
  this.SVGGrabber = elementIDs.SVGGrabber;
  this.INFOSelected = elementIDs.INFOSelected;
  this.pointer = elementIDs.pointer;
  this.pointerHover = elementIDs.pointerHover;

  this.init();
  this.initEvents();
};

FLOORPLAN.Selector.prototype = {
  init: function() {
    $("g g path", this.elementSVG).css("pointer-events", "all");
    $("g g path", this.elementSVG).css("cursor", "pointer");
    $('#' + this.pointer).css('color', this.settings.colors.primary);
  },


  initEvents: function() {
    var self = this;
    var colors = self.settings.colors;

    $(window).keydown(function(e) {
      down(e);
    });
    $(this.elementSVG).keydown(function(e) {
      down(e);
    });
    $(window).keyup(function(e) {
      up(e);
    });
    $(this.elementSVG).keyup(function(e) {
      up(e);
    });
    $('.overlay').mousemove(function(e) {
      //console.log(e.clientX);
    });

    function down(e) {
      if (e.keyCode == 17) {
        if ($('#' + self.SVGSelector).hasClass('selected-mode')) {
          $('#' + self.SVGGrabber).trigger('click');
        } else {
          $('#' + self.SVGSelector).trigger('click');
        }
      }
    }

    function up(e) {
      if (e.keyCode == 17) {
        if ($('#' + self.SVGSelector).hasClass('selected-mode')) {
          $('#' + self.SVGGrabber).trigger('click');
        } else {
          $('#' + self.SVGSelector).trigger('click');
        }
      }
    }

    // Selector activate
    $('#' + self.SVGSelector).bind("click", function() {
      $('#' + self.SVGOverlay).hide();
      $('#' + self.SVGGrabber).removeClass('selected-mode');
      $(this).addClass('selected-mode');
    });

    // Nav activate
    $('#' + self.SVGGrabber).bind("click", function() {
      $('#' + self.SVGOverlay).show();
      $('#' + self.SVGSelector).removeClass('selected-mode');
      $(this).addClass('selected-mode');
    });

    // Hover
    $("g g path, g g text", this.elementSVG).hover(function() {
      self.onHover($(this).parent().attr('id'));
    }, function() {
      self.clearHover($(this).parent().attr('id'));
    });

    // Select
    $("g g path, g g text", this.elementSVG).click(function() {
      self.onSelect($(this).parent().attr('id'));
    });

    $('.info-selected table tr').click(function() {
      self.onSelect($(this).data('id'));
    });

    // Hover
    $('.info-selected table tr').hover(function() {
      self.onHover($(this).data('id'));
    }, function() {
      self.clearHover($(this).data('id'));
    });

  },


  clearHover: function(id) {
    id = this.idConvert(id);

    $('#' + this.pointerHover).hide();
    var self = this;
    var element = $('#' + id, self.elementSVG);
    // Clear hover
    if (element.find('*').attr('class') != "selected") {
      element.children().each(function() {
        if ($(this).get(0).tagName == "path") {
          $(this).css("fill", "none");
          $(this).css("stroke", "#000");
        }
      });
    }
  },


  onHover: function(id) {
    id = this.idConvert(id);

    $('#' + this.pointerHover).show();
    var self = this;
    var element = $('#' + id, self.elementSVG);
    var colors = this.settings.colors;
    if (element.find('*').attr('class') != "selected") {
      element.children().each(function() {
        if ($(this).get(0).tagName == "path") {
          $(this).css("fill", colors.secondary);
          $(this).css("stroke", colors.secondary);
        }
        if ($(this).get(0).tagName == "text") {
          $(this).css("fill", "#000");
        }
      });

      if (element.children().get(0) != null) {
        var centerElement = Math.floor(element.children('path').length / 2);
        self.setArrow(element.children('path').get(centerElement).getBoundingClientRect(), this.pointerHover);
      } else {
        $('#' + this.pointerHover).hide();
      }
    }
  },


  onSelect: function(id) {
    id = this.idConvert(id);
    var self = this;
    var colors = self.settings.colors;
    var element = $('#' + id, self.elementSVG);
    this.selectedElement = element;

    // Clear old selected elements.
    $('.selected', self.elementSVG).css("fill", "none");
    $('.selected', self.elementSVG).css("stroke", "#000");
    $('.selected', self.elementSVG).attr('class', '');

    // Clear old selected text elements.
    $('.selected-text', self.elementSVG).css("fill", "#000");
    $('.selected-text', self.elementSVG).attr('class', '');

    element.children().each(function() {
      // Color new selected element.
      if ($(this).get(0).tagName == "path") {
        $(this).attr('class', 'selected');
        $(this).css("fill", colors.primary);
        $(this).css("stroke", colors.primary);
      }
      if ($(this).get(0).tagName == "text") {
        $(this).attr('class', 'selected-text');
        $(this).css('fill', '#333');
      }
    });


    self.selectedStorey = self.idConvert($('.selected', self.elementSVG).parent().parent().attr('id'));
    self.showArrow();

    // Set pointing arrow for lowvisibility selected items
    if (element.children().get(0) != null) {
      var centerElement = Math.floor(element.children('path').length / 2);
      self.setArrow(element.children('path').get(centerElement).getBoundingClientRect(), this.pointer);
    }


    self.showCurrentMeasurements(element);

    // Fill info container with matching XML info
    if(!this.settings.integratedMode) {
      setTimeout(function(){
        var laws = id;
        $('.info-selected tr.selected').removeClass('selected');
        $('[data-id="' + laws + '"]').addClass('selected');
        $('.after-info').remove();
        $('[data-id="' + laws + '"]').after('<tr class="after-info"></tr>');
        $('.after-info').html(self.xmlreader.findById(id));
        $('.info-selected').animate({
          scrollTop: $('[data-id="' + laws + '"]').offset().top + $('.info-selected').scrollTop() - $('.info-selected')[0].getBoundingClientRect().top
        }, {duration: 500, queue: false});
      }, 1);
    }
  },


  setArrow: function(bounds, pointer) {
    this.hasSelected = true;
    var pointer = $('#' + pointer);
    this.bounds = bounds;
    var font = pointer.css('font-size').replace('px', '');
    var halffont = font / 2;
    // Place an arrow under or above the selected element
    if (bounds.width > bounds.height) {
      if (bounds.top < 750) {
        var left = (bounds.left - halffont) + (bounds.width / 2);
        pointer.css('top', (bounds.top + bounds.height));
        pointer.css('left', left);
        pointer.attr('class', 'fa fa fa-arrow-up');
      } else {
        var left = (bounds.left - halffont) + (bounds.width / 2);
        pointer.css('top', (bounds.top - font));
        pointer.css('left', left);
        pointer.attr('class', 'fa fa fa-arrow-down');
      }
      // Place an arrow left or right of the selected element
    } else if (bounds.width < bounds.height) {
      if (bounds.left < 750) {
        var left = (bounds.left + bounds.width);
        pointer.css('top', (bounds.top + (bounds.height / 2) - halffont));
        pointer.css('left', left);
        pointer.attr('class', 'fa fa fa-arrow-left');
      } else {
        var left = (bounds.left - font);
        pointer.css('top', (bounds.top + (bounds.height / 2) - halffont));
        pointer.css('left', left);
        pointer.attr('class', 'fa fa fa-arrow-right');
      }
    }
  },


  showCurrentMeasurements: function(element) {
    if (!$("#measurements").hasClass('active') && (element.attr('class') === 'product IfcSpace')) {
      $('g.IfcSpace text', this.elementSVG).hide();
      $('text', element).show();
    }
  },


  updateArrow: function() {
    var element = this.selectedElement;
    // Set pointing arrow for lowvisibility selected items
    if (element !== null) {
      if (element.children().get(0) != null) {
        var centerElement = Math.floor(element.children('path').length / 2);
        this.setArrow(element.children('path').get(centerElement).getBoundingClientRect(), this.pointer);
      }
    }
  },


  idConvert: function(id) {
    if (id !== undefined) {
      if (id.indexOf("$") > -1) {
        id = id.split("$").join("\\$");
      }
    }

    return id;
  },


  hideArrow: function() {
    $('#' + this.pointer).hide();
  },


  showArrow: function() {
    $('#' + this.pointer).show();
  }
}
