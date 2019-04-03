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
  const GOOGLE_API_KEY = 'AIzaSyDyy0tzNE5Pvxx-hWO_SIgb-guPGWOo2vo';

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
    // const GOOGLE_FILTER_COMPONENTS = 'administrative_area_level_1:WA|country:US';
  const GOOGLE_FILTER_COMPONENTS = '';

  /**
   * Text to set in input when user clicks to use their current location.
   * @type {string}
   */
  const currentLocationText = 'Current location';

  /**
   * Text to set temporarily in input while browser is finding current location.
   * @type {string}
   */
  const locationLoadingText = 'Retrieving your location...';

  /**
   * Attach behaviors once Drupal readies page.
   * @type {{attach(*, *): void}}
   */
  Drupal.behaviors.uwmGeocodeInputInit = {

    attach(context, settings) {

      const $form = $('section.content-topper form[id*="uwm-locations-geo-search"]', context);

      if (!$form.length) {
        return;
      }

      const $wrapper = $form.parent('.filters-wrap');
      const $addressContainer = $form.find('.location-address-keywords');
      const $addressInput = $addressContainer.find('input[name=l]');
      const $currentLocationDropdown = $addressContainer.find('.field-suffix .dropdown');
      const $currentLocationDropdownMenu = $addressContainer.find('.field-suffix .dropdown-menu');
      const $currentLocationDropdownToggle = $addressContainer.find('.field-suffix .toggle-uml-dropdown');
      const $useMyLocationLink = $addressContainer.find('.dropdown a');
      const $latlngHiddenInput = $form.find('input[name=latlng]');


      // Set CSS classes on load to indicate if geocoded or current-location
      // search is active.
      if ($latlngHiddenInput.length && $latlngHiddenInput.val().length > 0) {
        $("body").addClass("search-with-geocoding");

        if ($addressInput.length && $addressInput.val() === 'Current location') {
          $("body").addClass("search-with-current-location");
        }
      }

      /**
       * Open the "Use my location" dropdown, if hidden.
       */
      const openDropdown = function () {
        if ($currentLocationDropdownMenu.is(':hidden')) {
          $currentLocationDropdown.addClass('uwm-display-dropdown');
          $addressContainer.addClass('active');
          $currentLocationDropdownToggle.attr('aria-expanded', 'true');
        }
      };

      /**
       * Close the "Use my location" dropdown, if open.
       */
      const closeDropdown = function () {
        if ($currentLocationDropdownMenu.is(':visible')) {
          $currentLocationDropdown.removeClass('uwm-display-dropdown');
          $addressContainer.removeClass('active');
          $currentLocationDropdownToggle.attr('aria-expanded', 'false');
        }
      };

      // On current-location icon click, toggle the dropdown.
      $currentLocationDropdownToggle.on('click', e => {
        e.preventDefault();

        if ($currentLocationDropdownMenu.is(':hidden')) {
          // Focus the address input; that handler opens the dropdown.
          $addressInput.focus();
        }
        else {
          closeDropdown();
        }
      });

      // On address input focus, open dropdown.
      $addressInput.on('focus', e => {
        openDropdown();
      });

      // On address input blur, call geocoding.
      // It will bypass if current location was selected, or if empty.
      $addressInput.on('blur', e => {
        getGeocodeResponse($addressInput.val());
      });

      // On Use-my-location dropdown link click, request user location via
      // browser and close dropdown.
      $useMyLocationLink.on('click', e => {
        e.preventDefault();

        closeDropdown();

        getNavigatorUserLocation();
      });

      // On Use-my-location link blur, close the dropdown.
      $useMyLocationLink.on('blur', e => {
        closeDropdown();
      });

      // On any 'focusin' event within the form wrapper, if the element being
      // focused is not within the address container, close dropdown.
      $wrapper.on('focusin', e => {

        if ($addressContainer.find($(e.target)).length === 0) {
          closeDropdown();
        }

      });


      // Geolocation functions:
      /**
       *
       * @param queryString
       */
      const getGeocodeResponse = function (queryString) {

        // When user clicks "Use my location" link, it populates the input with
        // "Current location" (if successful). Do not geocode this text.
        if (queryString === currentLocationText) {
          return;
        }

        if (!queryString) {
          clearUserLocation();
          return;
        }

        let apikey = GOOGLE_API_KEY;
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
          success(response) {
            if (response.status === "OK") {
              parseGeocodeResponse(response);
            }
            else {
              handleGeocodeError();
            }
          },
          error(xhr) {
            handleGeocodeError();
          },
          complete(xhr) {

            // If geocoding is happening, user has typed something, not clicked
            // "Use my location". Regardless of success or error, close the
            // dropdown to reset and ensure status message is visible.
            closeDropdown();

          }
        });


      };

      /**
       * Request user's location via browser.
       */
      const getNavigatorUserLocation = function () {

        if (!navigator.geolocation) {

          // TODO? Consider setting a distinct error message here for user.

          handleGeocodeError();

        }
        else {
          $addressInput.val(locationLoadingText);
          $addressInput.prop('disabled', true);

          // Per suggestion, set enableHighAccuracy to false, to increase
          // likelihood that IE/Windows will allow it (re: privacy settings).
          // @see https://stackoverflow.com/questions/43206442/geolocation-current-position-api-not-working-in-ie11-5-windows10
          let options = {};

          if (navigator.userAgent.indexOf('MSIE ') !== -1 || navigator.userAgent.indexOf('Trident/') !== -1) {
            options.enableHighAccuracy = false;
          }

          navigator.geolocation.getCurrentPosition((position) => {

            handleGeocodeSuccess(currentLocationText, position.coords.latitude, position.coords.longitude);
            $("body").addClass("search-with-current-location");

          }, (err) => {

            // TODO? Consider setting a distinct error message here for user.
            // `err.message` contains a human-readable message, e.g. "This site
            // does not have permissiont o use the Geolocation API."

            handleGeocodeError();
          }, options);
        }

      };

      /**
       * Extract latitude and longitude from geocode API response.
       * @param apiResponse
       * @return {*}
       */
      const parseGeocodeResponse = function (apiResponse) {

        const isValid = true;

        for (let i = 0; i < apiResponse.results.length; i++) {

          const item = apiResponse.results[i];

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

          }
          else {
            handleGeocodeError();
          }

        }

      };

      /**
       * Update UI and form values upon successful lat/lng retrieval.
       * @param updateInputText
       * @param lat
       * @param lng
       * @return {*}
       */
      const handleGeocodeSuccess = function (updateInputText, lat, lng) {

        clearUserLocation();

        $addressInput.prop('disabled', false);

        if (updateInputText) {
          $addressInput.val(updateInputText);
        }

        if (lat && lng) {
          $latlngHiddenInput.val(`${  lat  },${  lng  }`);
          $("body").addClass("search-with-geocoding");
        }
      };

      /**
       * Update UI upon geocoding error.
       * @return {*}
       */
      const handleGeocodeError = function () {

        clearUserLocation();
        setUserMessage('No matches found. Try again.');

      };

      /**
       * Clear hidden lat/lng value and status message, and remove geocoding
       * status CSS classes.
       */
      const clearUserLocation = function () {

        if ($addressInput.val() === locationLoadingText) {
          $addressInput.val('');
        }
        $addressInput.prop('disabled', false);

        $latlngHiddenInput.val('');
        $("body").removeClass("search-with-geocoding");
        $("body").removeClass("search-with-current-location");
        setUserMessage('');

      };

      /**
       * Tweak user input text to be geocoded.
       * @return {string}
       */
      const getCleanedKeywordSearch = function () {

        let returnValue = $addressInput.val().trim();

        // Get the JSON, UWM list of search and replace terms. These are keywords
        // we can use, repacing what the user typed with something that matches
        // better on the Google geocoding API.
        const srt = (typeof uwdm_gtm_search_location_keywords_replacements === 'undefined' )
          ? {} : uwdm_gtm_search_location_keywords_replacements;

        if (srt && srt.length) {

          srt.forEach((item) => {

            if (item.search_keywords && item.replacement_keywords) {

              const searchWord = item.search_keywords.toLowerCase();
              if(returnValue.toLowerCase() === searchWord) {
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
       * Update the status message below address input.
       * @param message
       */
      const setUserMessage = function (message) {

        $addressContainer.find('.status-message').text(message);

      };

    }

  };

})
(jQuery, Drupal);
