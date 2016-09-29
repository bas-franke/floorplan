FLOORPLAN.XMLReader = function(args) {
  _.extend(this, {
    XMLFilename: null,
    xml: null,
    settings: null
  }, args);

  this.init();

  var self = this;
};

FLOORPLAN.XMLReader.prototype = {
  init: function() {
    this.newFindAll();
  },
  newFindAll: function() {
    var self = this;
    var count = 0;
    var html = '';
    var storeyHTML = '';
    $(self.xml).find('ifc IfcBuildingStorey').each(function() {
      var parent = this;

      var storeyid = this.attributes[0].value;
      var type, xlink;

      storeyHTML += '<li data-storeyid="' + storeyid + '" class="storey-active">' + count + '</li>';

      html += '<table id="storey-' + count + '" style="font-size: 10px">';
      html += '<thead><tr class="storey-header"><th><span class="icon"><i class="fa fa-caret-square-o-down"></i></span>Storey ' + count + '</th></tr></thead>';

      $(this).find('*').each(function() {
        if (this.attributes.length > 1) {
          type = this.attributes[1].value;
          html += '<tr data-id="' + this.attributes[0].value + '" data-storey="' + storeyid + '"><td>' + type + '</td></tr>';
        }
      });

      $.each(this.attributes, function(i, attrib) {
        if (attrib.name == 'xlink:href') {
          var name = attrib.value;
          name = name.substring('1', name.length);
          id = name;
          xlink = id;
        }
      });
      count++;
      html += '</table>';
    });
    $('.newmenu').html(storeyHTML);

    $('.info-selected').html(html);
    $('.info-selected table tr').click(function() {
      console.log($(this).offset().top + $('.info-selected').scrollTop());
    });


  },
  findById: function(id) {
    var self = this;
    var html = '<ul>';
    //var length = $(this.xml).find('ifc [id="' + id + '"] *').length;


    // find xlink href for new ID
    $(self.xml).find('ifc [id="' + id + '"] *').each(function() {
      $.each(this.attributes, function(i, attrib) {
        if (attrib.name == 'xlink:href') {
          var name = attrib.value;
          name = name.substring('1', name.length);
          id = name;
        }
      });
    });


    // get properties based on xlink href id
    $(self.xml).find('ifc [id="' + id + '"]').each(function() {
      $.each(this.attributes, function(i, attrib) {
        html += self.viewAttributes(attrib);
      });

      $(this).find('*').each(function() {
        html += '<li>';
        $.each(this.attributes, function(i, attrib) {
          html += self.viewAttributes(attrib);
        });
        html += '</li>';
      });
    });
    html += '</ul>';
    return html;
  },
  viewAttributes: function(attrib) {
    var html = '';
    if (attrib.name != 'id') {
      if (attrib.name == 'Name') {
        html += '<li>' + attrib.value + '</li>';
      } else if (attrib.name == 'NominalValue') {
        html += '<li>' + attrib.value + '</li>';
      }
    }
    return html;
  }
}
