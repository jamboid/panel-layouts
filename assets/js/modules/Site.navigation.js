// Site.navigation.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child navigation
Site.navigation = (function ($) {
    "use strict";
  ///////////////
  // Variables //
  ///////////////

  var $window = $(window),
      $pageDocument = $('html').eq(0),
      $body = $('body').eq(0),

      selNav = ".cp_MainNav",
      selWrapper = ".wrapper",
      selNavToggle = ".nvToggle [data-action=toggle]",
      selNavMenu = "ul.menu",
      transitionTime = 200,

      selInPageLink = 'a.inPageLink',

      selInPageNavMenu = "[data-plugin=inPageMenu]",
      selInPageNav = "[data-plugin=inPageMenu] li a:not(.action)",

      selInPageAction = "[data-plugin=inPageMenu] li a.action",
      selInPageActionLink = ".inPageAction a",

      $mainPanels = $('[class*=cp_][id],[class*=rg_][id]'),

      selDropDownMenu = "[data-plugin=dropdown]",
      selDropDownToggle = "[data-action=toggle]",
      selDropDownMenuIContainer = ".menu",
      selDropDownMenuItems = ".menu > li",

      selDropDownToggleGlobal = "[data-plugin=dropdown] [data-action=toggle]",

  //////////////////
  // Constructors //
  //////////////////

      /**
       * Creates a MainNavMenu object to manage a responsive main navigation menu
       * @constructor
       */
      MainNavMenu = function (elem) {
        var $thisMainNav = $(elem),
            $menu = $thisMainNav.find(selNavMenu).eq(0),
            $menuToggle = $thisMainNav.find('[data-action=toggle]').eq(0),
            singleCellRatio = Site.grid.getSingleCellRatio(),
            screenWidth, menuMinHeight,

            /**
             * Show/Hide main navigation menu when in mobile/small-screen configuration
             * @function
             */
            toggleMainNav = function () {

              if ($body.hasClass("navVisible") === true) {
                $body.removeClass("navVisible");
              } else {
                //$.publish('showMainNav');
                $body.addClass("navVisible");
              }
            },

            /**
             * Close Nav Menu if it is open
             * @function
             */
            closeMainNav = function () {
              if ($body.hasClass("navVisible") === true) {
                $body.removeClass("navVisible");
              }
            },

            /**
             * Open Nav Menu if it is closed
             * @function
             */
            openMainNav = function () {
              if ($body.hasClass("navVisible") === false) {
                $body.addClass("navVisible");
              }
            },

            /**
             * Clone main nav menu into a slide menu container and append it inside the <body> tag
             * @function
             */
            createSlideMenu = function () {
              var $slideMenu = $('<div class="cp_SlideMenu">').append($menu.clone().addClass('mnSlide'));
              $body.append($slideMenu);
            },

            /**
             * Update the minimum height of the nav menu based on the width of the viewport
             * @function
             */
            updateMinHeight = function () {
              screenWidth = $(window).width();
              menuMinHeight = (screenWidth * singleCellRatio) - $menuToggle.height();
              $menu.css('min-height', menuMinHeight);
            },

            /**
             * Subscribe object to Global Messages
             * @function
             */
            subscribeToEvents = function () {
              $.subscribe('page/resize', function () { $(this).trigger('updatelayout');} , $thisMainNav);
              $.subscribe('navigation/close', function () { $(this).trigger('closeMainNav');} , $thisMainNav);
            },

            /**
             * Add event handler for main navigation toggle
             * @function
             */
            bindCustomMessageEvents = function () {
              $thisMainNav.on('toggleMainNav', function (e) {
                e.preventDefault();
                toggleMainNav();
              });

              $thisMainNav.on('openMainNav', function (e) {
                e.preventDefault();
                openMainNav();
              });

              $thisMainNav.on('closeMainNav', function (e) {
                e.preventDefault();
                closeMainNav();
              });

              $thisMainNav.on('updatelayout', function (e) {
                e.preventDefault();
                //updateMinHeight();
              });
            };

        /**
         * Initialise this object
         * @function
         */
        this.init = function () {
          bindCustomMessageEvents();
          subscribeToEvents();
          createSlideMenu();
          //updateMinHeight();
        };
      },

      /**
       * Creates a DropDownNavMenu object to manage a responsive main navigation menu
       * @constructor
       */
      DropDownNavMenu = function (elem) {

        var $thisMenu = $(elem),
            $menuContainer = $thisMenu.find(selDropDownMenuIContainer),
            $menuItems = $thisMenu.find(selDropDownMenuItems),
            $menuToggle = $thisMenu.find(selDropDownToggle),

            /**
             * Show/Hide main navigation menu when in mobile/small-screen configuration
             * @function
             */
            toggleDropDown = function () {
              if ($thisMenu.hasClass('isOpen') === true) {
                $thisMenu.addClass('transitionToClosed');
                $menuContainer.slideUp(200, 'easeInOutQuad', function () {
                  $thisMenu.removeClass('isOpen');
                  Site.utils.rs($(this));
                  $thisMenu.removeClass('transitionToClosed');
                });
              } else {
                $thisMenu.addClass('transitionToOpen');
                $menuContainer.slideDown(200, 'easeInOutQuad', function () {
                  $thisMenu.addClass('isOpen');
                  Site.utils.rs($(this));
                  $thisMenu.removeClass('transitionToOpen');
                });
              }
            },

            /**
             * Update the menu toggle with the current page name and hide the corresponding item in the menu
             * @function
             */
            updateCurrent = function () {
              var currentPageTitle = $menuItems.find('a.active').eq(0).text();
              $menuItems.find('a.active').closest('li').addClass('current');

              if(currentPageTitle === "") {
                currentPageTitle = "In this section";
              }

              $menuToggle.text(currentPageTitle);
            },

            /**
             * Subscribe object to Global Messages
             * @function
             */
            subscribeToEvents = function () {
              //$.subscribe('navigation/close', function () { $(this).trigger('closeMainNav');} , $thisMainNav);
            },

            /**
             * Add event handler for main navigation toggle
             * @function
             */
            bindCustomMessageEvents = function () {
              $thisMenu.on('toggleDropDown', function (e) {
                e.preventDefault();
                toggleDropDown();
              });

              $thisMenu.on('openDropDown', function (e) {
                e.preventDefault();
                openDropDown();
              });

              $thisMenu.on('closeDropDown', function (e) {
                e.preventDefault();
                closeDropDown();
              });

              $thisMenu.on('updatelayout', function (e) {
                e.preventDefault();
              });
            };

        /**
         * Initialise this object
         * @function
         */
        this.init = function () {
          bindCustomMessageEvents();
          subscribeToEvents();
          updateCurrent();
        };
      },

      /**
       * Creates a InPageNavMenu object to manage a sticky in-page nav menu
       * @constructor
       */
      InPageNavMenu = function (elem) {

        var $thisMenu = $(elem),
            offsetCoords = $thisMenu.offset(),
            topOffset = offsetCoords.top,
            menuHeight = $thisMenu.outerHeight(),
            inPageMenuHeight, menuIsSticky,

            // Update Position
            updatePosition = function () {
              offsetCoords = $thisMenu.offset(),
              topOffset = offsetCoords.top;
            },

            // Update menu's "current" link
            updateMenuActiveState = function () {

              var currentPos = $(document).scrollTop(),
                  set = false;

              $mainPanels.each(function () {
                var $thisPanel = $(this),
                    thisPanelHeight = $thisPanel.height(),
                    thisPanelOffset = $thisPanel.offset();

                if (set === false) {
                  var thisPanelID = $thisPanel.attr('id'),
                      navItemSel = selInPageNavMenu + ' a[href="' + window.location.pathname + '#' + thisPanelID + '"]';

                  //if((currentPos + menuHeight) < thisPanelOffset.top || currentPos > ((thisPanelOffset.top + thisPanelHeight) - menuHeight)) {
                  //  $(navItemSel).removeClass('current');

                  if((currentPos + menuHeight) < thisPanelOffset.top || currentPos > ((thisPanelOffset.top + thisPanelHeight) - menuHeight)) {


                  } else {
                    $thisMenu.find('li a.current').removeClass('current');
                    $(navItemSel).addClass('current');
                    set = true;
                  }
                }
              });
            },

            // Takes URL with Anchor and returns anchor
            getAnchorFromAnchorUrl = function (anchorUrl) {
              var thisUrl = anchorUrl,
                  index = thisUrl.indexOf('#'),
                  hash, anchor;

              if (index > 0) {
                hash = thisUrl.substring(index + 1);
                anchor = hash;
              } else {
                anchor = "";
              }
              return anchor;
            },

            setInPageNavMode = function () {
              var windowHeight = $window.height(),
                  scrollTop = $window.scrollTop();

              // If mainNav element is at top of page
              if (scrollTop > topOffset) {
                $pageDocument.addClass('fixedNav');
                $thisMenu.css('height', $thisMenu.find('.in').eq(0).outerHeight());
              } else {
                if($pageDocument.hasClass('fixedNav')) {
                  $pageDocument.removeClass('fixedNav');
                  Site.utils.resetStyles($thisMenu);
                }
              }
            },

            // Set scroll position at section
            setScrollPosition = function (selector, animate) {
              var headerOffset = menuHeight,
                  thisSelector = '#' + selector,
                  useAnimation = animate,
                  position, offSet, scrollTime;

              Site.analytics.trackPageEvent('In-page Navigation', 'Scroll to section', selector);

              position = $(thisSelector).eq(0).position();
              offSet = position.top;

              //offSet = position.top;

              if (offSet >= $window.scrollTop()) {
                offSet = offSet+2;
                scrollTime = (offSet - $window.scrollTop())/4;
              } else {
                offSet = offSet - (headerOffset-2);
                scrollTime = ($window.scrollTop() - offSet)/4;
              }

              if (useAnimation){
                //$thisMenu.addClass('autoScrolling');
                $('html, body').animate({ scrollTop: offSet}, scrollTime /*,
                function(){

                    setTimeout(function(){
                      Site.layout.setScrollDirection('up');
                      $thisMenu.removeClass('autoScrolling').trigger('showMenu');
                    }, 100);

                }*/);
              } else {
                $('html, body').scrollTop(offSet);
              }

              updateMenuState();
            },

            // Update fixed/static status of menu
            updateMenuState = function () {
              updateMenuActiveState();
              setInPageNavMode();
            },

            // Add event handler for main navigation toggle
            bindCustomMessageEvents = function () {
              $thisMenu.on('updatelayout', function (e) {
                e.preventDefault();
                updatePosition();
              });

              $thisMenu.on('updateMenuState', function (e) {
                e.preventDefault();
                updateMenuState();
              });

              $thisMenu.on('inpagelinkclicked', function (e) {
                e.preventDefault();
                setScrollPosition(getAnchorFromAnchorUrl(e.target.href), true);
              });

              $thisMenu.on('showMenu', function (e) {
                e.preventDefault();
                $thisMenu.addClass('showMenu');
              });

              $thisMenu.on('hideMenu', function (e) {
                e.preventDefault();
                $thisMenu.removeClass('showMenu');
              });
            },

            // Subscribe object to Global Messages
            subscribeToEvents = function () {
              $.subscribe('layout/change', function () {$(this).trigger('updatelayout');}, $thisMenu);
              $.subscribe('page/loaded', function () {$(this).trigger('updatelayout');}, $thisMenu);
              $.subscribe('page/resize', function () {$(this).trigger('updatelayout');}, $thisMenu);
              if(menuIsSticky) {
                $.subscribe('page/scroll', function () {$(this).trigger('updateMenuState');}, $thisMenu);

                // Subscribe to scroll direction events
                $.subscribe('scroll/up', function () {$(this).trigger('showMenu');}, $thisMenu);
                $.subscribe('scroll/down', function () {$(this).trigger('hideMenu');}, $thisMenu);
              }
            };


        this.init = function () {
          // Set menu mode
          if($thisMenu.hasClass('cp_Nav--inpage')) {
            menuIsSticky = true;
          } else {
            menuIsSticky = false;
            menuHeight = $('.cp_Nav--inpage .in').eq(0).outerHeight();
          }

          bindCustomMessageEvents();
          subscribeToEvents();
          setInPageNavMode();

          $thisMenu.find('a.action').each(function() {
            $(this).parent().addClass('action');

            if(!$(this).hasClass('action--alt')) {
              $(this).closest('[class*=cp_]').addClass('hasAction')
            }
          });

          //inPageMenuHeight = menuHeight;
        };
      },


      /**
       * Creates an InPageLink object to manage a deep-link navigation item
       * @constructor
       */
      InPageLink = function (elem) {
        var $thisInPageLink = $(elem),
            link = $thisInPageLink.attr('href'),
            queryTerm = $thisInPageLink.data('query'),

        // Get #id from URL and rebuild URL with a query string
        buildQueryUrlFromAnchorUrl = function (anchorUrl) {
          var thisUrl = anchorUrl,
              index = thisUrl.indexOf('#'),
              baseUrl, hash, query;

          if (index > 0) {
            baseUrl = thisUrl.substring(0, index);
            hash = thisUrl.substring(index + 1);
            query = baseUrl + "?" + queryTerm + '=' + hash;

          } else {
            query = thisUrl;
          }

          return query;
        },

        // Go the page using a modified URL
        goToLink = function () {
          window.location = buildQueryUrlFromAnchorUrl(link);
        },

        // Add event handler for main navigation toggle
        bindCustomMessageEvents = function () {
          $thisInPageLink.on('inpagelink', function (e) {
            e.preventDefault();
            goToLink();
          });
        };

        this.init = function () {
          bindCustomMessageEvents();
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

        // Create delegated event listeners
        if(Modernizr.touch) {
          Site.events.delegate('click', selNavToggle, 'toggleMainNav');
        } else {
          Site.events.delegate('click', selNavToggle, 'toggleMainNav');
        }

        Site.events.delegate('click', selInPageLink, 'inpagelink');

        // Create a global messenger for a click event on the page wrapper (or any child element)
        Site.events.global('click', selWrapper, 'navigation/close', false);
      },

      /**
       * Initialise this module
       * @function
       */
      init = function () {
        Site.utils.cl("Site.navigation initialised");

        $(selNav).each(function () {
          var newNav = new MainNavMenu(this);
          newNav.init();
        });

        $(selDropDownMenu).each(function () {
          var newDropDownNavMenu = new DropDownNavMenu(this);
          newDropDownNavMenu.init();
        });

        $(selInPageLink).each(function () {
          var thisInPageLink = new InPageLink(this);
          thisInPageLink.init();
        });

        delegateEvents();
      };

  ///////////////////////
  // Return Public API //
  ///////////////////////

  return {
    init: init
  };
}(jQuery));