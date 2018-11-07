(function (Drupal, $) {

    'use strict';

    Drupal.behaviors.toggleViewMoreText = {
        attach: function () {

            $('.collapse').on('shown.bs.collapse', function() {
                $(".view-more-link[aria-expanded='true']").text("View Less");
            });
            
            $('.collapse').on('hidden.bs.collapse', function () {
                $(".view-more-link[aria-expanded='false']").text("View More");
            })
        }
    };

    // We pass the parameters of this anonymous function are the global variables
    // that this script depend on. For example, if the above script requires
    // jQuery, you should change (Drupal) to (Drupal, jQuery) in the line below
    // and, in this file's first line of JS, change function (Drupal) to
    // (Drupal, $)
})(Drupal, jQuery);
