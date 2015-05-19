// Site.panelslider.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.panelslider = (function ($) {
	"use strict";

  ///////////////
  // Variables //
  ///////////////

	var panelsliderSel = '[data-plugin="panelslider"]',
	    panelsliderPanelSel = panelsliderSel+' .gp_Panel',
	    panelsliderControlsSel = '.slider-control',
	    panelsliderDotSel = '.slider-control li a',
	    panelsliderInit = false,
	    panelsliderPanelCount = $(panelsliderPanelSel).length,
	    panelsliderElement = '<li class="dot" data-nav-id="{id}"><a href="#"></a></li>',

  //////////////////
  // Constructors //
  //////////////////

   SliderContent = function(elem) {
	  var $thisSliderContent = $(elem),

	    /**
       * Setup panelslider and controls
       * @function
       */
      setupSlider = function() {
	       if(panelsliderPanelCount !== $('.gp_Panel').length || !panelsliderInit) {
				for (var i = 0; i < panelsliderPanelCount; i++) {
					var tempHTML = panelsliderElement.replace("{id}", i + 1);
					$(panelsliderControlsSel+' ul').append(tempHTML);
				}
			}

			if(panelsliderPanelCount === 0 || undefined) {
				$(panelsliderControlsSel+' ul').html('');
			}

			panelsliderInit = true;
       },

      /**
       * Slide to panel
       * @function
       */
      slideTo = function(e) {
        $('html, body').stop().animate({
				  scrollTop: $('div[data-panel-id="'+$(e).parent('li').attr('data-nav-id')+'"]').offset().top
		      }, 600, "swing", function() {
		    });
		    if($(panelsliderControlsSel+' .dot').hasClass('active')) {
		    	$(panelsliderControlsSel+' .dot').removeClass('active');
		    }
        $(e).parent('li').addClass('active');
      },

      /**
       * Change active dot to the panel in the window view
       * @function
       */
      updateSlider = function() {
			  var thresh = $(window).height()/2;

        for (var i = 0; i < panelsliderPanelCount; i++) {
					if($(window).scrollTop() > ($('div[data-panel-id="'+(i + 1)+'"]').offset().top - thresh)  && $(window).scrollTop() < ($('div[data-panel-id="'+(i + 1)+'"]').offset().top + thresh)) {
					if($(panelsliderControlsSel+' .dot').hasClass('active')) {
						$(panelsliderControlsSel+' .dot').removeClass('active');
					}
					$(panelsliderControlsSel+'  li[data-nav-id="'+(i + 1)+'"]').addClass('active');

					var controlClass = $('div[data-panel-id="'+(i + 1)+'"]').attr('data-control-class');
					$(panelsliderControlsSel).removeClass (function (index, css) {
					    return (css.match (/(^|\s)slider-control--\S+/g) || []).join(' ');
					});
					$(panelsliderControlsSel).addClass(controlClass);
				}
			}
		},


      /**
       * Bind custom message events for this object
       * @function
       */
      bindCustomMessageEvents = function () {
        $thisSliderContent.on('slidechange', function (e) {
           e.preventDefault();
           e.stopPropagation();
           slideTo(e.target);
        });
        $thisSliderContent.on('scrollchange', function () {
           updateSlider();
        });
      },


      /**
       * Subscribe object to Global Messages
       * @function
       */
      subscribeToEvents = function () {
		    $.subscribe('page/scroll', function () {$(this).trigger('scrollchange');}, $thisSliderContent);
      };


      /**
       * Initialise this object
       * @function
       */
      this.init = function () {
      	setupSlider();
      	updateSlider();
        bindCustomMessageEvents();
        subscribeToEvents();
      };


  },

  ///////////////
  // Functions //
  ///////////////

  	/**
     * Create delegate event listeners for this module
     * @function
     */
    delegateEvents = function () {
      Site.events.delegate('click', panelsliderDotSel, 'slidechange');
    },

    init = function () {
      Site.utils.cl("Site.panelslider initialised");
      delegateEvents();

      $(panelsliderSel).each(function() {
        var thisSliderContent= new SliderContent(this);
        thisSliderContent.init();
      });
    };

	///////////////////////
  // Return Public API //
  ///////////////////////

 return {
		init: init
	};

}(jQuery));
