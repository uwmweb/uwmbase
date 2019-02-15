"use strict";

/**
 * @file
 * Custom global JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.accordion = {
    attach: function attach(context, settings) {
      var uwQueryParam = function uwQueryParam(urlPart) {
        urlPart = urlPart.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + urlPart + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      };

      var scrollToAnchorPath = function scrollToAnchorPath(anchorPath) {
        var parts = anchorPath.split("/");
        $(parts).each(function (a, anchorPart) {
          var $elm = $('button[data-target="#' + anchorPart + '"]');

          if ($elm.is(":hidden")) {
            anchorPart = anchorPart.replace("desktop", "mobile");
            $elm = $('button[data-target="#' + anchorPart + '"]');
          }

          if (!$elm.attr("id")) {
            $elm.attr("id", anchorPart + "anchor");
          }

          $elm.trigger("click");

          if (a + 1 === parts.length) {
            console.log("parts.length", parts.length);
            if (typeof $.scrollTo === "function") {
              $.scrollTo("#" + $elm.attr("id"));
            }
          }
        });
      };

      if (window.location.toString().indexOf("scroll") > 0) {
        var scrollPath = uwQueryParam("scroll");
        scrollToAnchorPath(scrollPath);
      }
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=accordion.js.map
