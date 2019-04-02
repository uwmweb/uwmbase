'use strict';

// Sample JSON for Google Tag Manager and hook to
// replace a user's search term with the terms we provide:
//
// const uwdm_gtm_search_location_keywords_replacements = [
//   {
//     "search_keywords": "Ravenna",
//     "replacement_keywords": "Ravenna, Seattle, WA",
//     "match_full_text_only": "TRUE"
//   }, {
//     "search_keywords": "Ballard",
//     "replacement_keywords": "Ballard, Seattle, WA",
//     "match_full_text_only": "TRUE"
//   }
// ];


/**
 *
 * Script to take the address a user has typed in our location search form,
 * and to query Google's Geocode API for the best possible location match. We
 * then use the latitude/ longitude for a Drupal locations search.
 *
 */
(function ($, Drupal) {

  /**
   * Provide API key for requests.
   * @see https://console.cloud.google.com/home/dashboard?project=uw-medicine
   * @type {string}
   */
  var GOOGLE_API_KEY = 'AIzaSyDyy0tzNE5Pvxx-hWO_SIgb-guPGWOo2vo';

  /**
   * Provide API key without hostname restrictions.
   * @see https://console.cloud.google.com/home/dashboard?project=uw-medicine
   * @type {string}
   */
  var GOOGLE_API_KEY_TEMP = 'AIzaSyB6ziIhPThPpqSPKLeJKs1wnblBXQbbxe4';
  /**
   * Provide base url for our geocode, Google.
   * @see https://developers.google.com/maps/documentation/geocoding/start
   * @type {string}
   */
  var GOOGLE_GEOCODER_BASEURL = 'https://maps.googleapis.com/maps/api/geocode/json?';

  /**
   * Preferred bounding box for results.
   * @see https://developers.google.com/maps/documentation/geocoding/intro#Viewports
   * @type {string}
   */
  var GOOGLE_FILTER_BOUNDING_BOX = '46.709241,-123.422571|48.254976,-119.381319';

  /**
   * Limit results to these criteria.
   * @see https://developers.google.com/maps/documentation/geocoding/intro#ComponentFiltering
   * @type {string}
   */
  // const GOOGLE_FILTER_COMPONENTS = 'administrative_area_level_1:WA|country:US';
  var GOOGLE_FILTER_COMPONENTS = '';

  /**
   *
   * @type {*|HTMLElement}
   */
  var $form = $();

  /**
   * Attach behaviors once Drupal readies page.
   * @type {{attach(*, *): void}}
   */
  Drupal.behaviors.uwmGeocodeInputInit = {
    attach: function attach(context, settings) {

      $form = $('section.content-topper form', context);

      if (!$form.length) {
        return;
      }

      var $addressContainer = $form.find('.location-address-keywords');
      var $addressInput = $addressContainer.find('input[name=l]');
      var $currentLocationDropdown = $addressContainer.find('.field-suffix .dropdown');
      var $currentLocationDropdownMenu = $addressContainer.find('.field-suffix .dropdown-menu');
      var $currentLocationDropdownToggle = $addressContainer.find('.field-suffix .toggle-uml-dropdown');
      var $coordsHiddenInput = $form.find('input[name=uml]');

      // Set state on load:
      if ($coordsHiddenInput.length && $coordsHiddenInput.val().length > 0) {
        $("body").addClass("search-with-geocoding");

        if ($addressInput.length && $addressInput.val() === 'Current location') {
          $("body").addClass("search-with-current-location");
        }
      }

      // Handle current-location icon click:
      $currentLocationDropdownToggle.on('click', function (e) {
        e.preventDefault();

        // Focus the address input; that handler opens the dropdown.
        $addressInput.focus();
      });

      // Handle address input focus:
      $addressInput.on('focus', function (e) {
        if ($currentLocationDropdownMenu.is(':hidden')) {
          $currentLocationDropdown.addClass('uwm-display-dropdown');
          $addressContainer.addClass('active');
          $currentLocationDropdownToggle.attr('aria-expanded', 'true');
        }
      });

      // Handle address input blur:
      $addressInput.on('blur', function (e) {

        // Do not hide dropdown if the element that caused this to blur was:
        // a) the use my location link - ensure the click handler fires while
        //    the element is still visible; it will hide the dropdown.
        //    (TODO: This is not good for accessibility - keyboard navigation
        //    causes blur on the field without clicking this link, leaving
        //    dropdown open.)
        // b) the current location icon - it focuses this field anyway, so we
        //    don't want it to blur and re-focus, causing the dropdown to
        //    close and re-open.
        if (e.relatedTarget && (e.relatedTarget.id === "umlDropdownLink" || $(e.relatedTarget).is($currentLocationDropdownToggle))) {
          return;
        }

        if ($currentLocationDropdownMenu.is(':visible')) {
          $currentLocationDropdown.removeClass('uwm-display-dropdown');
          $addressContainer.removeClass('active');
          $currentLocationDropdownToggle.attr('aria-expanded', 'false');
        }

        getGeocodeResponse($addressInput.val());
      });

      // Handle Use-my-location dropdown link click:
      $addressContainer.find('.dropdown a').on('click', function (e) {
        e.preventDefault();

        $currentLocationDropdown.removeClass('uwm-display-dropdown');
        $addressContainer.removeClass('active');
        $currentLocationDropdownToggle.attr('aria-expanded', 'false');

        getNavigatorUserLocation();
      });
    }
  };

  /**
   *
   * @param queryString
   */
  var getGeocodeResponse = function getGeocodeResponse(queryString) {

    if (!queryString) {
      clearUserLocation();
      return;
    }

    var apikey = GOOGLE_API_KEY;
    if (window.location.host.indexOf('local') > 0) {
      apikey = GOOGLE_API_KEY_TEMP;
    }

    $.ajax({
      url: GOOGLE_GEOCODER_BASEURL,
      dataType: "json",
      type: "GET",
      data: {
        address: getCleanedKeywordSearch(),
        bounds: GOOGLE_FILTER_BOUNDING_BOX,
        components: GOOGLE_FILTER_COMPONENTS,
        key: apikey
      },
      success: function success(response) {
        if (response.status === "OK") {
          parseGeocodeResponse(response);
        } else {
          handleGeocodeError();
        }
      },
      error: function error(xhr) {
        handleGeocodeError();
      }
    });
  };

  var getNavigatorUserLocation = function getNavigatorUserLocation() {

    handleGeocodeSuccess('Current location');
    if (!navigator.geolocation) {
      handleGeocodeError();
    } else {
      navigator.geolocation.getCurrentPosition(function (position) {

        handleGeocodeSuccess('Current location', position.coords.latitude, position.coords.longitude);
        $("body").addClass("search-with-current-location");
      }, function () {
        handleGeocodeError();
      });
    }
  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  var parseGeocodeResponse = function parseGeocodeResponse(apiResponse) {

    var isValid = true;

    for (var i = 0; i < apiResponse.results.length; i++) {

      var item = apiResponse.results[i];

      // Do our match validation...
      // The geocode API assumes an address was provided. Since we may have any
      // search string, and parsing Google address component is brittle,
      // let's just validate the user input is in the formatted result.
      // const arr = USER_SEARCH_STRING.toLowerCase().split(' ');
      // arr.forEach((pt) => {
      //   if (item.formatted_address.toLowerCase().replace(' ', '').indexOf(pt) >= 0) {
      //     isValid = true;
      //   }
      // });

      // Save preferred result...
      if (isValid && item && item.geometry && item.geometry.location) {

        // handleGeocodeSuccess(item.formatted_address, item.geometry.location.lat, item.geometry.location.lng);
        handleGeocodeSuccess(null, item.geometry.location.lat, item.geometry.location.lng);
      } else {
        handleGeocodeError();
      }
    }
  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  var handleGeocodeSuccess = function handleGeocodeSuccess(updateInputText, lat, lng) {

    clearUserLocation();

    $("body").addClass("search-with-geocoding");

    if (updateInputText) {
      $('input[name=l]').val(updateInputText);
    }

    if (lat && lng) {
      $('input[name=uml]').val(lat + ',' + lng);
    }
  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  var handleGeocodeError = function handleGeocodeError() {

    clearUserLocation();

    $('input[name=uml]').val('');
    $("body").removeClass("search-with-geocoding");
    $("body").removeClass("search-with-current-location");
    setUserMessage('No matches found. Try again.');
  };

  /**
   *
   * @param message
   */
  var clearUserLocation = function clearUserLocation() {

    $('input[name=uml]').val('');
    $("body").removeClass("search-with-geocoding");
    $("body").removeClass("search-with-current-location");
    setUserMessage('');
  };

  /**
   *
   * @return {string}
   */
  var getCleanedKeywordSearch = function getCleanedKeywordSearch() {

    var returnValue = $('input[name=l]').val().trim();

    // Get the JSON, UWM list of search and replace terms. These are keywords
    // we can use, repacing what the user typed with something that matches
    // better on the Google geocoding API.
    var srt = typeof uwdm_gtm_search_location_keywords_replacements === 'undefined' ? {} : uwdm_gtm_search_location_keywords_replacements;

    if (srt && srt.length) {

      srt.forEach(function (item) {

        if (item.search_keywords && item.replacement_keywords) {

          var searchWord = item.search_keywords.toLowerCase();
          if (returnValue.toLowerCase() === searchWord) {
            returnValue = item.replacement_keywords;
          }

          // const arr = returnValue.toLowerCase().split(' ');
          // arr.forEach((pt) => {
          //
          //   returnValue = returnValue.replace(search_value, replacement_value);
          //
          // });
        }
      });
    }

    return returnValue;
  };

  /**
   *
   * @param message
   */
  var setUserMessage = function setUserMessage(message) {

    var $form = $('.content-topper .status-message');
    $form.text(message);
  };
})(jQuery, Drupal);
//# sourceMappingURL=search-geocode-input.js.map
