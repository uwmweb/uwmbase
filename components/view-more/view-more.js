(function (Drupal, $) {

    'use strict';

    Drupal.behaviors.toggleViewMoreText = {
        attach: function () {

            // add angle down icons
            $(".view-more-link[aria-expanded='false']").each(function(index, value){
                if($(value).children('.fa-angle-down').length == 0 ) {
                    $(value).append('<i class="fas fa-angle-down fa-fw"></i>')
                }

                if( ! $(value).attr('tabindex') ) {
                    $(value).attr('tabindex', 0);
                }
            });

            $('.collapse').on('shown.bs.collapse', function() {
                $(".view-more-link[aria-expanded='true']").text('View Less').append('<i class="fas fa-angle-up fa-fw"></i>');
            });
            
            $('.collapse').on('hidden.bs.collapse', function () {
                $(".view-more-link[aria-expanded='false']").text("View More").append('<i class="fas fa-angle-down fa-fw"></i>');
            })
        }
    };
})(Drupal, jQuery);
