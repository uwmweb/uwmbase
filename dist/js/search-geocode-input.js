'use strict';

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
  //const GOOGLE_FILTER_COMPONENTS = 'administrative_area_level_1:WA|country:US';
  var GOOGLE_FILTER_COMPONENTS = '';

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
          //if (e.which === 13) {
          USER_SEARCH_STRING = $input.val();
          getGeocodeResponse();
          // }
        });
      });
    }
  };

  /**
   *
   * @return {*|HTMLElement}
   */
  var getGeocodeInput = function getGeocodeInput() {

    var $container = $('section.content-topper');
    if (!$container.find('form input[name=l]').length) {

      var $input = $('<input name="l">');
      $container.append($input);
    }

    return $container.find('input[name=l]');
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
        address: USER_SEARCH_STRING,
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

    setUserMessage('Searching for ' + USER_SEARCH_STRING + '...');
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

        handleGeocodeSuccess(item.formatted_address, item.geometry.location.lat, item.geometry.location.lng);
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
  var handleGeocodeSuccess = function handleGeocodeSuccess(address, lat, long) {

    $("body").removeClass("search-geocode-fail").addClass("search-geocode-success");

    $('input[name=uml]').val('');
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

    $('input[name=uml]').val('');
    $("body").removeClass("search-geocode-fail").addClass("search-geocode-success");
  };

  /**
   *
   * @param message
   */
  var setUserMessage = function setUserMessage(message) {

    var $container = $('.content-topper .filter-tips');
    $container.text(message);
  };
})(jQuery, Drupal);
//# sourceMappingURL=search-geocode-input.js.map
