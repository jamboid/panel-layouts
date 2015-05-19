// Site.events.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.events = (function ($) {
    "use strict";

  ///////////////
  // Variables //
  ///////////////

    var $body = $('body').eq(0),

  ///////////////
  // Functions //
  ///////////////

        /**
         * Bind custom Global events that will result in a "Publish" message being broadcast
         * @function
         */
        bindGlobalMessages = function () {

          // Handle page scroll
          $(window).on('scroll', function () {
            $.publish('page/scroll');
          });

          // Handle debounced resize
          $(window).on('debouncedresize', function () {
            $.publish('page/resize');
          });

          // Register Hammer touch events on body
          // This lets you treat these touch events as the normal delegate events
          // - CURRENTLY OVERKILL TO DO THIS - JUST BIND INDIVIDUAL COMPONENTS (e.g. See Carousel)
          //$body.hammer();

        },

        /**
         * Simple factory function to trigger a global message upon a delegated event
         * - note that preventDefault is only called if the preventBubble parameter is false
         * @function
         * @parameter eventType (string)
         * @parameter selector (string)
         * @parameter message (string)
         * @parameter preventBubble (boolean)
         *
         */
        createGlobalMessenger = function (eventType, selector, message, preventBubble) {

          $body.on(eventType, selector, function (e) {
            if(preventBubble){
              e.preventDefault();
            }

            // The message is published with the event object (e) as attached data
            $.publish(message, e);
          });
        },

        /**
         * Simple factory function to bind a common delegated event listener to the <body> element
         * @function
         * @parameter eventType (string)
         * @parameter selector (string)
         * @parameter eventToTrigger (string)
         */
        createDelegatedEventListener = function (eventType, selector, eventToTrigger) {
          $body.on(eventType, selector, function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(e.target).trigger(eventToTrigger);
          });
        },

        /**
         * Initialise this module
         * @function
         */
        init = function () {
          Site.utils.cl("Site.events initialised");
          bindGlobalMessages();
        };

  ///////////////////////
  // Return Public API //
  ///////////////////////

    return {
      init: init,
      delegate: createDelegatedEventListener,
      global: createGlobalMessenger
    };

}(jQuery));
