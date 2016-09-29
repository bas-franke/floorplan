FLOORPLAN.Application = function(args) {

	_.extend(this, {
		elementSVG: null,
		SVGLoaded: false
	}, args);

	this.settings = null;
}

FLOORPLAN.Application.prototype = {
	floorplan: function() {
		if (this.settings == null) {
			this.settings = new FLOORPLAN.Settings();
		}
		this.loadElements();
	},
	loadElements: function() {
		var self = this;

		// Load the SVG file
		var svgDoc = document.getElementById(self.settings.elementIDs.SVG).getSVGDocument();
		if (svgDoc != null) {
			this.onSVGLoad();
		} else {
			document.getElementById(this.settings.elementIDs.SVG).addEventListener("load", function() {
				self.onSVGLoad();
			});
		}
	},
	init: function(svgDoc, xml) {
		if (!this.loaded) {
			this.elementSVG = $( svgDoc.documentElement );

			this.loadingComplete();
			this.resizeContainer();

			$('g text', this.elementSVG).hide();
			$('g.IfcSpace text', this.elementSVG).show();

			if (this.settings.integratedMode) {
		      $('#slider').hide();
					$('.info-selected').hide();
					$('.menucontainer').addClass('integrated');
			}

			this.loadClasses(svgDoc, xml);
		}
	},
	loadClasses: function(svgDoc, xml) {
		this.elementSVG = $( svgDoc.documentElement );

		// Set css for svg elements
		this.svgstyle = new FLOORPLAN.SVGStyle({
			settings: this.settings,
			elementSVG: this.elementSVG
		});

		this.xmlreader = new FLOORPLAN.XMLReader({
			XMLFilename: this.XMLFilename,
			xml: xml,
			settings: this.settings
		});
		this.selector = new FLOORPLAN.Selector({
			settings: this.settings,
			elementSVG: this.elementSVG,
			xmlreader: this.xmlreader
		});
		this.camera = new FLOORPLAN.Camera({
			settings: this.settings,
			selectorC: this.selector,
			elementSVG: this.elementSVG,
			angle: 0
		});
		this.menu = new FLOORPLAN.Menu({
			settings: this.settings,
			elementSVG: this.elementSVG,
			selector: this.selector
		});

	},
	resizeContainer: function () {
		var elements = this.settings.elementIDs;

		if (this.settings.svgWidth == 0) {
			this.settings.svgWidth = $('#' + elements.SVG).width();

		}
		if (this.settings.svgHeight == 0) {
			this.settings.svgHeight = $('#' + elements.SVG).height();
		}

		$('#' + elements.SVG).css('width', this.settings.svgWidth);
		$('#' + elements.SVG).css('height', this.settings.svgHeight);

		this.settings.initialHeight = this.elementSVG.width();
		this.settings.initialWidth = this.elementSVG.height();

		var resizeWidthProx = (this.elementSVG.width() + (this.elementSVG.width() / 3));
		var resizeHeightProx = (this.elementSVG.height() + (this.elementSVG.height() / 3));
		var resizeWidth =  resizeWidthProx * $('.storey', this.elementSVG).length;
		var resizeHeight = resizeHeightProx;
		$('#' + elements.SVG).css('width', resizeWidth);
		$('#' + elements.SVG).css('height', resizeHeight);
		$('#' + elements.pointerContainer).css('height', resizeHeight);
		$('#' + elements.pointerContainer).css('width', resizeWidth);

		this.settings.newWidth = this.elementSVG.width();
		this.settings.newHeight = this.elementSVG.height();
	},
	loadingComplete: function () {
		this.loaded = true;
		$('#sidemenu').show();
		$('#overlay').css('background-color', 'transparent');
		$('#loading').fadeOut('slow');
	},
	onSVGLoad: function() {
		var self = this;

		var svgDoc = document.getElementById(self.settings.elementIDs.SVG).getSVGDocument();
		$.ajax({
			type: "GET",
			url: 'assets/' + self.XMLFilename + '.xml',
			dataType: "xml",
			success: function(xml) {
				self.init(svgDoc, xml);
			}
		});

	}
}
