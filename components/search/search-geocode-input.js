/**
 * @file
 * Custom JavaScript for UW Medicine.
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
   * Preferred area for matches; note other spots may get matched.
   * @see https://developers.google.com/maps/documentation/geocoding/intro#Viewports
   * @type {string}
   */
  const PREF_BOUNDING_BOX = '46.709241,-123.422571|48.254976,-119.381319';

  /**
   * Attach behaviors once Drupal readies page.
   * @type {{attach(*, *): void}}
   */
  Drupal.behaviors.uwmGeocodeInputInit = {

    attach(context, settings) {

      $(document).ready(() => {
        $('section.content-topper ').append('<input class="geo-location-input">');

        const $input = getGeocodeInput();
        $input.keypress(e => {
          if (e.which === 13) {
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

    return $('section.content-topper input.geo-location-input');
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

    setResponseMessage(`Searching for ${  getGeocodeInput().val()  }...`);

    $.ajax({
      url: GOOGLE_GEOCODER_BASEURL,
      dataType: "json",
      type: "GET",
      data: {
        key: apikey,
        address: getGeocodeInput().val(),
        bounds: PREF_BOUNDING_BOX
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

  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  const handleGeocodeSuccess = function (apiResponse) {

    setResponseMessage(`Found results for ${  getGeocodeInput().val()  }.`);
    // let latLon = response.results[0].geometry.location;
    const latLong = (((apiResponse || {}).results || []).geometry || {}).location;
    if (latLong.lat && latLong.lng) {
      setResponseMessage(`${latLong.lat  },${  latLong.lng}`);
    }

    // Set lat, long, submit form...

  };

  /**
   *
   * @param apiResponse
   * @return {*}
   */
  const handleGeocodeError = function (apiResponse) {

    setResponseMessage(`No results for ${  getGeocodeInput().val()  }.`);


  };

  /**
   *
   * @param message
   */
  const setResponseMessage = function (message) {

    const $input = getGeocodeInput();
    $input.val("");
    $input.attr('placeholder', message);

  };


})
(jQuery, Drupal);
