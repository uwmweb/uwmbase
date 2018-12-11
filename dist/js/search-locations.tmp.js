"use strict";

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {

  Drupal.behaviors.uwmSearchMap = {
    attach: function attach(context, settings) {
      initAll();
    }
  };

  var map = void 0;
  var infoWindow = void 0;
  var geocoder = void 0;

  function initAll() {
    $("form.views-exposed-form").submit(function () {});

    var focus = 0;

    var blur = 0;

    $("form.views-exposed-form").find("input[name=s]").focusout(function () {
      focus++;
      var s = $(this).val();
      $("#focus-count").text("focusout fired: " + focus + "x" + s);
      geocodeAddress(geocoder, map, s);
      getMapCenter();
      initMap();
      getMapRadiusLength();
      geocodeAddress();
    }).blur(function () {
      blur++;
      var s = $(this).val();
      $("#blur-count").text("blur fired: " + blur + "x " + s);
    });
  }

  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 6
    });

    infoWindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent("Location found.");
        infoWindow.open(map);
        map.setCenter(pos);
      }, function () {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation.");
    infoWindow.open(map);
  }

  function getMapCenter() {
    return map.getCenter();
  }

  function getMapRadiusLength() {
    var bounds = map.getBounds();
    var center = map.getCenter();
    if (bounds && center) {
      var ne = bounds.getNorthEast();
      // Calculate radius (in meters).
      var radius = google.maps.geometry.spherical.computeDistanceBetween(center, ne);
    }
  }

  function geocodeAddress(geocoder, resultsMap, search) {
    var address = search || document.getElementById("address").value;
    geocoder.geocode({ address: address }, function (results, status) {
      if (status === "OK") {
        resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
})(jQuery, Drupal);
//# sourceMappingURL=search-locations.tmp.js.map
