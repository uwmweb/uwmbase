'use strict';

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */
//
(function ($, Drupal) {

    Drupal.behaviors.uwmSearchLayout = {

        attach: function attach(context, settings) {
            var $searchInputVal = $('#views-exposed-form-uwm-search-providers-page-1 input[name="s"]').attr('value');
            if ($searchInputVal) {
                $('.results-alphabetical-disclaimer').hide();
            }
        }
    };
})(jQuery, Drupal);
//# sourceMappingURL=search-providers.js.map
