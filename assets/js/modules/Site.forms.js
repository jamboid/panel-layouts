// Site.namespace.js

// Check if base namespace is defined so it isn't overwritten
var Site = Site || {};

// Create child namespace
Site.forms = (function ($) {
    "use strict";


  ///////////////
  // Variables //
  ///////////////

    var isPlaceholderSupported,

        selFileUploadField = "input[type=file]",

  //////////////////
  // Constructors //
  //////////////////


    /**
     * Creates an FileUploadManager object to create a more customisable file upload form field
     * @constructor
     */
    FileUploadManager = function () {

      var overlayTemplate = '<span class="fileUpload">',

      /**
       * Add/Update File Upload Overlay container
       * @function
       */
      updateOverlay = function (data) {
        var $thisFileUploadInput = $(data.target),
            $fileOverlay = $thisFileUploadInput.prev(),
            fileName;

        Site.utils.cl($thisFileUploadInput);

        if ($fileOverlay.length > 0) {

        } else {
          $fileOverlay = $(overlayTemplate);
          $thisFileUploadInput.before($fileOverlay)
        }

        fileName = $thisFileUploadInput.val().split('\\').pop();

        $fileOverlay.text(fileName);

        setFormValidation();
      },

      /**
       * Bind custom message events for this object
       * @function
       */
      bindCustomMessageEvents = function () {
        /*
        $thisMainNav.on('', function (e) {
          e.preventDefault();
        });
        */
      },

      /**
       * Subscribe object to Global Messages
       * @function
       */
      subscribeToEvents = function () {
        $.subscribe('fileupload/change', function (topic,data) { updateOverlay(data); });
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


        // Set placeholder attribute using label text
        setPlaceholders = function () {
          $('.form-item').each(function(){
            var formElem = $(this).find('input, textarea').not('input[type=submit]').eq(0),
                formLabel = $(this).find('label').eq(0),
                formLabelText = $(formLabel).text(),
                mandSpan = $(formLabelText).find('.form-required');
                formLabelText = $(formLabel).text();
                $(formElem).attr('placeholder', formLabelText);
          });

          // Now the placeholders have been set, make sure the fallback is in place for
          // browsers that don't have native support for the attribute
          isPlaceholderSupported = Site.utils.placeholderIsSupported();

          if(!isPlaceholderSupported){
            setPlaceholderFallback();
          }
        },

        // Add placeholder-like behaviour for form fields in browsers that don't support it
        setPlaceholderFallback = function () {
          // Create default text for text field on page load
          var createText = function (defVal, thisObj) {
            if (thisObj.attr("value") === defVal || thisObj.attr("value").length === 0) {
              thisObj.attr("value", defVal);
              thisObj.addClass("empty");
            }
          },

          // Remove default text on focus. Ignore user-inserted text
          removeText = function (defVal, thisObj) {
            var currVal = thisObj.attr("value");
            if (currVal === defVal) {
              thisObj.attr("value", "");
              thisObj.removeClass("empty");
            }
          },

          // Restore default text on focus. Ignore user-inserted text
          restoreText = function (defVal, thisObj) {
            var currVal = thisObj.attr("value");
            if (currVal !== undefined && currVal !== '') {
              thisObj.attr("value", currVal);
            } else if (currVal === undefined || currVal === '') {
              thisObj.attr("value", defVal);
              thisObj.addClass("empty");
            }
          };

          Site.utils.cl(isPlaceholderSupported);

          if (!isPlaceholderSupported){

            Site.utils.cl('Placeholder not supported');
            // Get inputs with a placeholder attribute set
            $("input[placeholder], textarea[placeholder]").each(function() {
              var labelVal = $(this).attr("placeholder");
              $(this).each(function() {
                  createText(labelVal, $(this));
              });
              // Removal of text on user-focus
              $(this).focus(function() {
                  removeText(labelVal, $(this));
              });
              // Restoration of default text on input blur, if no user input.
              $(this).blur(function() {
                  restoreText(labelVal, $(this));
              });
            });
          }
        },


        setFormValidation = function () {

          // Check if form to be validated exists

          /*
          jQuery.extend(jQuery.validator.messages, {
              required: "This field is required.",
              remote: "Please fix this field.",
              email: "Please enter a valid email address.",
              url: "Please enter a valid URL.",
              date: "Please enter a valid date.",
              dateISO: "Please enter a valid date (ISO).",
              number: "Please enter a valid number.",
              digits: "Please enter only digits.",
              creditcard: "Please enter a valid credit card number.",
              equalTo: "Please enter the same value again.",
              accept: "Please enter a value with a valid extension.",
              maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
              minlength: jQuery.validator.format("Please enter at least {0} characters."),
              rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
              range: jQuery.validator.format("Please enter a value between {0} and {1}."),
              max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
              min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
          });
          */

          $.validator.addMethod("exactlength", function(value, element, param) {
           return this.optional(element) || value.length == param;
          });


          // Update default error messages for specific languages
          jQuery.extend(jQuery.validator.messages, {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL."
          });

          jQuery.validator.addMethod("require_from_group", function(value, element, options) {
          	var validator = this,
          	    selector = options[1],
                validOrNot = jQuery(selector, element.form).filter(function() {
                  return validator.elementValue(this);
          	    }).length >= options[0];

          	if(!jQuery(element).data('being_validated')) {
          		var fields = jQuery(selector, element.form);
          		fields.data('being_validated', true);
          		fields.valid();
          		fields.data('being_validated', false);
          	}
          	return validOrNot;
          }, jQuery.validator.format("Which type of model would you like to be? Please select at least one option from the list."));


          if( $('form').length > 0 ){

            // General form validation
            $('.cp_Form form, .cp_Forms form').each(function () {
              $(this).validate({
                groups: {
                  modelCheckboxes: "field_user_levels[gents] field_user_levels[long_hair] field_user_levels[cut] field_user_levels[colour]"
                },

                rules: {
                  mail: {
                    required: true,
                    email: true
                  },
                  "files[field_user_photograph]" : {
                    required: true,
                    accept: "image/jpeg, image/pjpeg, image/png"
                  },
                  "field_user_levels[gents]": {
                    require_from_group: [1, ".form-checkboxes input"]
                  },
                  "field_user_levels[long_hair]": {
                    require_from_group: [1, ".form-checkboxes input"]
                  },
                  "field_user_levels[cut]": {
                    require_from_group: [1, ".form-checkboxes input"]
                  },
                  "field_user_levels[colour]": {
                    require_from_group: [1, ".form-checkboxes input"]
                  }
                },

                messages: {
                  mail:{
                    required: "Please enter your email so we can get in touch with you"
                  },
                  "files[field_user_photograph]": {
                    required: "We'd love to see what look you're currently rocking",
                    accept: "Sorry, please pick an image"
                  }
                },

                errorPlacement: function(error, element) {
                  if (element.is(':file')) {
                    error.appendTo( $(".form-type-managed-file") );
                  } else if (element.closest('.form-checkboxes').length > 0) {
                    error.appendTo( element.closest('.form-checkboxes'));
                  } else {
                    error.appendTo( element.parent());
                  }
                }
              });
            });

          }
        },

        /**
         * Create delegate event listeners for this module
         * @function
         */
        delegateEvents = function () {
          Site.events.global('change',selFileUploadField,'fileupload/change', false);
          //Site.events.delegate('click',selBookingFormConfirm,'showform');
        },


        init = function () {
          Site.utils.cl("Site.forms initialised");
          setFormValidation();
          delegateEvents();

          // Create a new HeightManager object
          var thisFileUploadManager = new FileUploadManager();
          thisFileUploadManager.init();
        };


  ///////////////////////
  // Return Public API //
  ///////////////////////

    return {
      init: init
    };

}(jQuery));