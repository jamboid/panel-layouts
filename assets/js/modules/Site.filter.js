// Site.filter.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.filter = (function ($) {
    "use strict";

  ///////////////
  // Variables //
  ///////////////

    var simpleFilterSel = "[data-plugin=filter]",
        simpleFilterControlsSel = "[data-filter=controls]",
        simpleFilterActionSel = "[data-filter-target]",
        simpleFilterContentsSel = "[data-filter=section]",

        eventSimpleFilterControlSel = "[data-plugin=filter] [data-filter-target]",

        transitionTime = 500,

  //////////////////
  // Constructors //
  //////////////////

        /**
         * Creates an SimpleFilter object
         * @constructor
         */
        SimpleFilter = function (elem) {

          var $thisFilter = $(elem),
              $filterControls = $thisFilter.find(simpleFilterActionSel),
              $showAllControl = $filterControls.filter('.showAll'),
              $filterContentSections = $thisFilter.find(simpleFilterContentsSel),

          /**
           * Update the filter to show the section that corresponds to the activated control
           * @function
           * @parameter activeControl - the control that was activated
           */
          updateFilter = function (activeControl) {
            var targetSel = '#' + activeControl.data('filter-target'),
                $newTarget = $filterContentSections.filter(targetSel),
                $otherSections = $filterContentSections.not(targetSel);

            //Site.utils.cl(targetSel);

            $filterControls.removeClass('active');
            $newTarget.slideDown(transitionTime, 'easeInOutQuad');
            $otherSections.slideUp(transitionTime, 'easeInOutQuad');
            activeControl.addClass('active');
          },

          /**
           * Reset the filter to show all the content sections
           * @function
           */
          resetFilter = function () {
            $filterContentSections.each(function(){

              $(this).slideDown(transitionTime, 'easeInOutQuad', function() {
                $(this).removeClass('activeContent');
              });
            });

            $thisFilter.removeClass('filterActive');
            $filterControls.removeClass('active');
            $showAllControl.addClass('active');
          },

          /**
           * Bind custom message events for this object
           * @function
           */
          bindCustomMessageEvents = function () {
            $thisFilter.on('toggleFilter', function (e) {
              e.preventDefault();

              // If currently active control is clicked reset the filter to it's default state
              if($(e.target).hasClass('active') || $(e.target).hasClass('showAll')){
                resetFilter();
              } else {
                updateFilter($(e.target));
              }

              Site.analytics.trackPageEvent('Price Category Filter', 'Category Changed', 'Category: ' + $(e.target).parent().attr('id'));
            });
          },

          /**
           * Subscribe object to Global Messages
           * @function
           */
          subscribeToEvents = function () {

          };

          /**
           * Initialise this object
           * @function
           */
          this.init = function () {
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
          Site.events.delegate('click', eventSimpleFilterControlSel, 'toggleFilter');
        },

//         /**
//          * Initialise a new Object for an element added after the DOM is ready
//          * @function
//          */
//          createObject = function (elem) {
//            var newObject = new Object(elem);
//             newObject.init();
//          },


        /**
         * init function for this module
         * @function
         */
        init = function () {
          //Site.utils.cl("Site.filter initialised");

          // Initialise Objects objects based on DOM objects
          $(simpleFilterSel).each(function () {
            var thisSimpleFilter = new SimpleFilter(this);
            thisSimpleFilter.init();
          });

          // Add delegate event listeners for this module
          delegateEvents();
        };

  ///////////////////////
  // Return Public API //
  ///////////////////////

    return {
      //createObject:createObject,
      init: init
    };

}(jQuery));