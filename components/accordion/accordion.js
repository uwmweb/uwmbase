/**
 * @file
 * Custom deeplinking functionality based on an accordion section data-target id.
 */

(function($, Drupal) {
  Drupal.behaviors.accordion = {
    // ?scroll=collapse-accordion-33996-1
    // to find a data-target id, inspect the page source and select the value in the "data-target" 
    // attribute, excluding the # sign.
    attach: function(context, settings) {
      var uwQueryParam = function(urlPart) {
        urlPart = urlPart.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + urlPart + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null
          ? ""
          : decodeURIComponent(results[1].replace(/\+/g, " "));
      };

      var scrollToAnchorPath = function(anchorPath) {
        var parts = anchorPath.split("/");
        $(parts).each(function(a, anchorPart) {
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
            $.scrollTo("#" + $elm.attr("id"));
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
