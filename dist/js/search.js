'use strict';

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.uwHeaderSearchClick = {
    attach: function attach(context, settings) {

      $.fn.selectpicker.Constructor.BootstrapVersion = '4';
      $('.selectpicker').selectpicker();
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=search.js.map
