'use strict';

/**
 *
 * @file
 * Custom JavaScript for UW Medicine.
 *
 * @note
 * Component filtering does not support neighborhood; locality component filter
 * not more useful than lat/lng bounds field
 *
 *
 *
 */
//
(function ($, Drupal) {

  /**
   * Provide API key for requests.
   * @see https://console.cloud.google.com/home/dashboard?project=uw-medicine
   * @type {string}
   */
  var GOOGLE_API_KEY = 'AIzaSyDtdMuu9kpdNE--4xUNT1aSuy-wh9vxFtg';

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
  var GOOGLE_FILTER_COMPONENTS = ''; // 'country:US';

  /**
   *
   * @type {{lat: string, lng: string}}
   */
  var MATCHED_COORDINATES = {
    lat: '', lng: ''
  };

  /**
   *
   * @type {string}
   */
  var USER_SEARCH_STRING = '';

  /**
   * Attach behaviors once Drupal readies page.
   * @type {{attach(*, *): void}}
   */
  Drupal.behaviors.uwmGeocodeInputInit = {
    attach: function attach(context, settings) {

      $(document).ready(function () {

        var $input = getGeocodeInput();
        $input.keypress(function (e) {
          if (e.which === 13) {
            USER_SEARCH_STRING = $input.val();
            getGeocodeResponse();
          }
        });
      });
    }
  };

  /*
   * PRIVATE FUNCTIONS
   *
   */

  /**
   *
   * @return {*|HTMLElement}
   */
  var getGeocodeInput = function getGeocodeInput() {

    var $container = $('section.content-topper');
    if (!$container.find('input[name=place-search]').length) {

      var $input = $('<input class="geo-location-input form-control form-control-lg" name="place-search" placeholder="Search location">');
      $container.append($input);
    }

    return $container.find('input[name=place-search]');
  };

  /**
   *
   * @param queryString
   */
  var getGeocodeResponse = function getGeocodeResponse(queryString) {

    var apikey = GOOGLE_API_KEY;
    if (window.location.host.indexOf('local') > 0) {
      apikey = GOOGLE_API_KEY_TEMP;
    }

    $.ajax({
      url: GOOGLE_GEOCODER_BASEURL,
      dataType: "json",
      type: "GET",
      data: {
        key: apikey,
        address: USER_SEARCH_STRING,
        bounds: GOOGLE_FILTER_BOUNDING_BOX,
        component: GOOGLE_FILTER_COMPONENTS
      },
      success: function success(response) {
        if (response.status === "OK") {
          handleGeocodeSuccess(response);
        } else {
          handleGeocodeError(response);
        }
      },
      error: function error(xhr) {
        handleGeocodeError();
      }
    });

    setResponseMessage('Searching for ' + USER_SEARCH_STRING + '...');
  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  var handleGeocodeSuccess = function handleGeocodeSuccess(apiResponse) {

    var isValid = false;
    setResponseMessage('Found results for ' + USER_SEARCH_STRING + '.');

    var _loop = function _loop(i) {

      var item = apiResponse.results[i];

      // Do our match validation...
      // The geocode API assumes an address was provided. Since we may have any
      // search string, and parsing Google address component is brittle,
      // let's just validate the user input is in the formatted result.
      var arr = USER_SEARCH_STRING.toLowerCase().split(' ');
      arr.forEach(function (pt) {
        if (item.formatted_address.toLowerCase().indexOf(pt) >= 0) {
          isValid = true;
        }
      });

      // Save preferred result...
      if (isValid && item && item.geometry && item.geometry.location) {

        MATCHED_COORDINATES.lat = item.geometry.location.lat;
        MATCHED_COORDINATES.lng = item.geometry.location.lng;

        setResponseMessage('Searching ' + USER_SEARCH_STRING + ' matched \'' + item.formatted_address + '\' (' + JSON.stringify(MATCHED_COORDINATES) + ')');

        $('input[name=uml]').val(MATCHED_COORDINATES.lat + ',' + MATCHED_COORDINATES.lng);
      }
    };

    for (var i = 0; i < apiResponse.results.length; i++) {
      _loop(i);
    }
  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  var handleGeocodeError = function handleGeocodeError(apiResponse) {

    setResponseMessage('No results for "' + USER_SEARCH_STRING + '"');
  };

  /**
   *
   * @param message
   */
  var setResponseMessage = function setResponseMessage(message) {

    var $input = getGeocodeInput();
    $input.val(message);
  };
})(jQuery, Drupal);
//# sourceMappingURL=search-geocode-input.js.map