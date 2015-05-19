// Site.modal.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.modal = (function ($) {
    "use strict";

  ///////////////
  // Variables //
  ///////////////

    var modalSel = "[data-modal=source]",
        modalCloseSel = '.cp_Modal .close',
        modalContinueSel = '.cp_Modal .continueLink a',
        modalContentSel = '.modalContent',
        modalScreenSel = '.modalScreen',
        modalTemplate = '<div class="modalContent"><div id="confirmation-popup" class="cp_Modal"><div class="in modalContentContainer"><div class="close"><a href="#">Close</a></div></div></div></div>',
        modalScreenTemplate = "<div class='modalScreen'></div>",
        $window = $(window),
        $body = $('body'),

        modalLinkSel = "[data-modal=source]",

  /////////////
  // Classes //
  /////////////

        /**
         * Constructor for a Modal object that manages modal dialog for displaying site information and external iframes
         * @constructor
         * @parameter element (Object)
         * @parameter modalTyle (String) - can be either 'inpage' or 'iframe'
         */
        Modal = function (element, modalType, modalID) {

          var $modalSource = $(element),
              thisModalID = modalID,
              thisModalType = modalType,
              $thisModal = $(modalTemplate),
              $modalScreen = $(modalScreenTemplate),
              $closeButton = $thisModal.find(modalCloseSel),

          /**
           * Display a piece of page content in a modal window
           * @function
           */
          displayContentInModal = function () {
            if (thisModalType === 'iframe'){
              $thisModal.addClass('iframeModal');
            }
            $thisModal.find('.modalContentContainer').append($modalSource);
            $body.append($thisModal).append($modalScreen);
            positionModal();
          },

          /**
           * Display the content of a page link in a modal
           * @function
           */
          displayPageLinkInModal = function () {
            $thisModal.addClass('iframeModal');
            $thisModal.find('.modalContentContainer').append($modalSource);
            $body.append($thisModal).append($modalScreen);
            positionModal();
            $.publish('content/change',$modalSource);
          },

          /**
           * Display the content of a page link in a modal
           * @function
           */
          displaySmartImageInModal = function () {
            $thisModal.addClass('imageModal');
            $thisModal.find('.modalContentContainer').append($modalSource);
            $body.append($thisModal).append($modalScreen);
            positionModal();
            $.publish('content/change',$modalSource);
          },

          /**
           * Positions the modal optimally within the viewport
           * @function
           */
          positionModal = function () {
            var windowWidth = $window.width(),
                windowHeight = $window.height(),
                modalWidth = $thisModal.width(),
                modalHeight = $thisModal.height(),
                scrollTop = $window.scrollTop(),
                topPos = (((windowHeight-modalHeight)/2)+scrollTop)-10,
                leftPos = ((windowWidth/2)-(modalWidth/2));

            if(topPos < 0){
              topPos = 0;
            }

            if(leftPos < 0){
              leftPos = 0;
            }

            $thisModal.css('top',topPos).css('left', leftPos).addClass('displayed');
          },

          /**
           * Turn the modal from holding state to final state once content is loaded
           * @function
           */
          activateModal = function () {
            $thisModal.addClass('imageLoaded');
            positionModal();

            Site.analytics.trackPageEvent('Modal Image', 'Modal Opened', 'Image ID: ' + thisModalID);

            var delayPosition = setTimeout(function() {
              positionModal();
            }, 1000);
          },

          /**
           * Close the modal
           * @function
           */
          closeModal = function () {
            $thisModal.fadeOut(function () {
              $thisModal.empty();
              $thisModal.remove();
            });

            $modalScreen.fadeOut(function () {
              $modalScreen.remove();
            });

            Site.analytics.trackPageEvent('Modal Image', 'Modal Closed', 'Image ID: ' + thisModalID);
          },

          /**
           * Add event handlers for this object
           * @function
           */
          bindCustomMessageEvents = function () {

            $thisModal.on('closeModal', function (e) {
              e.preventDefault();
              closeModal();
            });

            $thisModal.on('updatelayout', function (e) {
              e.preventDefault();
              positionModal();
            });

            $thisModal.on('activateModal', function (e) {
              e.preventDefault();
              activateModal();
            });

            $modalScreen.on('closeModal', function (e) {
              e.preventDefault();
              closeModal();
            });
          },

          /**
           * Subscribe object to Global Messages
           * @function
           */
          subscribeToEvents = function () {
            $.subscribe('page/resize', function () {$(this).trigger('updatelayout');},$thisModal);
            $.subscribe('content/update', function () {$(this).trigger('updatelayout');},$thisModal);
            $.subscribe('page/scroll', function () {$(this).trigger('updatelayout');},$thisModal);
            $.subscribe('image/loaded', function () {$(this).trigger('activateModal');},$thisModal);
          };

          /**
           * Initialise this object
           * @function
           */
          this.init = function () {

            displayContentInModal();

            if (thisModalType === 'inpage') {
              displayPageContentInModal();
            } else if (thisModalType === 'image') {
              displaySmartImageInModal();
            } else if (thisModalType === 'iframe') {
              displayPageLinkInModal();
            }

            bindCustomMessageEvents();
            subscribeToEvents();
          };
        },


        /**
         * Creates a ModalLinkManager object to manage modal links
         * @constructor
         */
        ModalLinkManager = function () {

          var $modalLinkContent = $('<div class="modalImage">'),

          /**
           * Display modal content
           * @function
           */
          createModalContent = function (data) {
            var $thisModalLink = $(data.target),
                modalLinkID = $thisModalLink.attr('id') || 'unidentified',
                modalLinkURL = $thisModalLink.attr('href'),

                $image = $('<div class="image" data-image-load="pageload" data-image-config=\'{ "type" : "inline", "reload" : true }\' data-src-small="' + modalLinkURL + '" data-src-medium="' + modalLinkURL + '" data-src-large="' + modalLinkURL + '" data-src-xlarge="' + modalLinkURL + '" data-src-xxlarge="' + modalLinkURL + '" data-src-static="' + modalLinkURL + '">');

            $modalLinkContent.empty();
            $modalLinkContent.append($image);
            createModal(modalLinkID);
          },

          createModal = function (id) {
             var thisNewModal = new Modal($modalLinkContent, 'image', id);
             thisNewModal.init();
          },

          /**
           * Subscribe object to Global Messages
           * @function
           */
          subscribeToEvents = function () {
            $.subscribe('display/modal', function (topic,data) { createModalContent(data); });
          };

          /**
           * Initialise this object
           * @function
           */
          this.init = function () {
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
          Site.events.delegate('click', modalCloseSel, 'closeModal');
          Site.events.delegate('click', modalContinueSel, 'closeModal');
          Site.events.delegate('click', modalScreenSel, 'closeModal');
          Site.events.global('click',modalLinkSel,'display/modal', true);
        },

        /**
         * init function for this module
         * @function
         */
        init = function () {
          Site.utils.cl("Site.modal initialised");

          // Initialise Modal object for page-load content
          /*
          $(modalSel).each(function () {
            var thisModal = new Modal(this, 'inpage');
            thisModal.init();
          });
          */
          // Initialise ModalLinkManager object to manage current and future modal links

          var thisModalLinkManager = new ModalLinkManager(this);
          thisModalLinkManager.init();

          // Add delegate event listeners for this module
          delegateEvents();
        };

  ///////////////////////
  // Return Public API //
  ///////////////////////

    return {
      init: init
    };

}(jQuery));