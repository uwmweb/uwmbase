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
  const GOOGLE_API_KEY = 'AIzaSyDtdMuu9kpdNE--4xUNT1aSuy-wh9vxFtg';

  /**
   * Provide API key without hostname restrictions.
   * @see https://console.cloud.google.com/home/dashboard?project=uw-medicine
   * @type {string}
   */
  const GOOGLE_API_KEY_TEMP = 'AIzaSyB6ziIhPThPpqSPKLeJKs1wnblBXQbbxe4';
  /**
   * Provide base url for our geocode, Google.
   * @see https://developers.google.com/maps/documentation/geocoding/start
   * @type {string}
   */
  const GOOGLE_GEOCODER_BASEURL = 'https://maps.googleapis.com/maps/api/geocode/json?';

  /**
   * Preferred bounding box for results.
   * @see https://developers.google.com/maps/documentation/geocoding/intro#Viewports
   * @type {string}
   */
  const GOOGLE_FILTER_BOUNDING_BOX = '46.709241,-123.422571|48.254976,-119.381319';

  /**
   * Limit results to these criteria.
   * @see https://developers.google.com/maps/documentation/geocoding/intro#ComponentFiltering
   * @type {string}
   */
  const GOOGLE_FILTER_COMPONENTS = ''; // 'country:US';

  /**
   *
   * @type {{lat: string, lng: string}}
   */
  const MATCHED_COORDINATES = {
    lat: '', lng: ''
  };

  /**
   *
   * @type {string}
   */
  let USER_SEARCH_STRING = '';

  /**
   * Attach behaviors once Drupal readies page.
   * @type {{attach(*, *): void}}
   */
  Drupal.behaviors.uwmGeocodeInputInit = {

    attach(context, settings) {

      $(document).ready(() => {

        const $input = getGeocodeInput();
        $input.keypress(e => {
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
  const getGeocodeInput = function () {

    const $container = $('section.content-topper');
    if (!$container.find('input[name=place-search]').length) {

      const $input = $('<input class="geo-location-input form-control form-control-lg" name="place-search" placeholder="Search location">');
      $container.append($input);

    }

    return $container.find('input[name=place-search]');
  };

  /**
   *
   * @param queryString
   */
  const getGeocodeResponse = function (queryString) {

    let apikey = GOOGLE_API_KEY;
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
      success(response) {
        if (response.status === "OK") {
          handleGeocodeSuccess(response);
        }
        else {
          handleGeocodeError(response);
        }
      },
      error(xhr) {
        handleGeocodeError();
      }
    });

    setResponseMessage(`Searching for ${  USER_SEARCH_STRING  }...`);

  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  const handleGeocodeSuccess = function (apiResponse) {

    let isValid = false;
    setResponseMessage(`Found results for ${  USER_SEARCH_STRING  }.`);

    for (let i = 0; i < apiResponse.results.length; i++) {

      const item = apiResponse.results[i];

      // Do our match validation...
      // The geocode API assumes an address was provided. Since we may have any
      // search string, and parsing Google address component is brittle,
      // let's just validate the user input is in the formatted result.
      const arr = USER_SEARCH_STRING.toLowerCase().split(' ');
      arr.forEach((pt) => {
        if (item.formatted_address.toLowerCase().indexOf(pt) >= 0) {
          isValid = true;
        }
      });

      // Save preferred result...
      if (isValid && item && item.geometry && item.geometry.location) {

        MATCHED_COORDINATES.lat = item.geometry.location.lat;
        MATCHED_COORDINATES.lng = item.geometry.location.lng;

        setResponseMessage(`Searching ${  USER_SEARCH_STRING  } matched '${  item.formatted_address  }' (${  JSON.stringify(MATCHED_COORDINATES)  })`);

        $('input[name=uml]').val(`${MATCHED_COORDINATES.lat },${ MATCHED_COORDINATES.lng}`);

      }

    }

  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  const handleGeocodeError = function (apiResponse) {

    setResponseMessage(`No results for "${  USER_SEARCH_STRING }"`);

  };

  /**
   *
   * @param message
   */
  const setResponseMessage = function (message) {

    const $input = getGeocodeInput();
    $input.val(message);

  };


})
(jQuery, Drupal);
