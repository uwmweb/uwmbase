/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.uwHeaderSearchClick = {
    attach(context, settings) {


      $.fn.selectpicker.Constructor.BootstrapVersion = '4';
      $('.selectpicker').selectpicker();

    }
  };
})(jQuery, Drupal);
