FLOORPLAN.Menu = function(args) {
	_.extend(this, {
		elementSVG: null,
		xmlreader: null,
		settings: null
	}, args);

  var elementIDs = this.settings.elementIDs;
	this.container = $('#' + elementIDs.container);

	this.init();
	this.initEvents();
	this.updateContainers();
	this.initBottomStoreys();
	var self = this;
};

FLOORPLAN.Menu.prototype = {
	init: function() {
		var self = this;
		//$('.sidemenu').addClass('fullscreen-menu');
		$('.right').hide();
		self.measurements(false);

		if (this.settings.smallmenu) {
			$('.' + this.settings.elementIDs.Menu).addClass('smallmenu');
		}

		if (this.container.width() < '1000') {
			this.toggleMenu();
		}

	},
	initEvents: function() {
		var self = this;

		$(window).resize(function() {
			self.updateContainers();
		});

		// Toggle the menu
		$('.toggle').bind('click', function() {
			self.toggleMenu();
		});

		$('#sidemenu #help').bind('click', function(){
			$('#help-overlay').animate({width:'toggle'},350);
			if ($('#help').hasClass('selected')) {
				$('#help').removeClass('selected');
			} else {
				$('#help').addClass('selected');
			}
		});

		$('.info-selected table th').bind('click', function() {
			var tbody = $(this).parent().parent().parent().find('tbody');
			if (tbody.css('display') == 'none') {
				tbody.show();
				$('.icon').html('<i class="fa fa-caret-square-o-down"></i>');
			} else {
				tbody.hide();
				$('.icon').html('<i class="fa fa-caret-square-o-up"></i>');
			}
		});

		$('.settings li').bind('click', function() {
			if ($(this).hasClass('active')) {
				$(this).removeClass('active');
				switch($(this).attr('id')) {
					case 'measurements':
						self.measurements(false);
						break;
					case 'arrows':
						self.arrows(false);
						break;
				}
			} else {
				$(this).addClass('active');
				switch($(this).attr('id')) {
					case 'measurements':
						self.measurements(true);
						break;
					case 'arrows':
						self.arrows(true);
						break;
				}
			}
		});

		$('.newmenu li').mousedown(function(event) {
			switch (event.which) {
				case 1:
					if ($(this).attr('class') == 'storey-active') {
						$(this).removeClass('storey-active');
					} else {
						$(this).addClass('storey-active');
					}
				break;
				case 3:
					if ($(this).attr('class') == 'storey-active' && $('.newmenu li.storey-active').length == 1) {
						$('.newmenu li').addClass('storey-active');
					} else {
						$('.newmenu li').removeClass('storey-active');
						$(this).addClass('storey-active');
					}
					break;
			}
			self.refresh();
			var selectedStorey = $('#' + self.selector.selectedStorey, self.elementSVG);
			if (selectedStorey.css('display') == 'none') {
				self.selector.hideArrow();
			} else {
				self.selector.showArrow();
			}
		});
	},


	refresh: function() {
		var self = this;
		$('.newmenu li').each(function(){
			if ($(this).attr('class') == 'storey-active') {
				$("#" + self.selector.idConvert($(this).data("storeyid")), self.elementSVG).show();
				$('#storey-' + $(this).html()).show();
			} else {
				$("#" + self.selector.idConvert($(this).data("storeyid")), self.elementSVG).hide();
				$('#storey-' + $(this).html()).hide();
			}
		});
	},


	initBottomStoreys: function () {
		var self = this;
		this.hideAllStoreys();
		this.showStorey(1);

		var firstFloor = $('g:nth-child(1) g', self.elementSVG).size();
		var secondFloor = $('g:nth-child(2) g', self.elementSVG).size();

		if ((secondFloor * 0.3) > firstFloor) {
				this.showStorey(2);
		}

		this.refresh();
	},


	toggleMenu: function() {
		var self = this;
		if($('.menucontainer:visible').length == 0)	{
			$('.right').hide();
			$('.left').show();
			setTimeout(function(){
				self.updateContainers();
			}, 1);
		} else {
			$('.left').hide();
			$('.right').show();
			this.updateContainers();
		}
		$('.menucontainer').toggle();
	},


	measurements: function(enabled) {
		if (enabled) {
			$('g.IfcSpace text', this.elementSVG).show();
		} else {
			$('g.IfcSpace text', this.elementSVG).hide();
		}
	},


	arrows: function(enabled) {
		if (enabled) {
				$('#pointer').css('font-size', this.settings.arrowSize + 'px');
				$('#pointer-hover').css('font-size', this.settings.arrowSize + 'px');
		} else {
				$('#pointer').css('font-size', '0');
				$('#pointer-hover').css('font-size', '0');
		}
	},


	showStorey: function (storey) {
		$('.newmenu li:nth-child(' + storey + ')').addClass('storey-active');
	},


	hideStorey: function (storey) {
		$('.newmenu li:nth-child(' + storey + ')').removeClass('storey-active');
	},


	hideAllStoreys: function () {
		$('.newmenu li').removeClass('storey-active');
	},


	showAllStoreys: function () {
		$('.newmenu li').removeClass('storey-active');
		$('.newmenu li').addClass('storey-active');
	},


	updateContainers: function () {
		var newHeight = $('.floorplan').height() - $('#info-selected').offset().top + $('.floorplan').offset().top;
		$('.info-selected').css('height', newHeight);
		$('#help-overlay').css('left', $('.menucontainer').width());
	}
}
