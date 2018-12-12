"use strict";

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.setupSearchFacets = {
    attach: function attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      var $selects = $(".selectpicker");
      $selects.selectpicker();
      $selects.on("loaded.bs.select", function (e, clickedIndex, isSelected, previousValue) {
        $(".views-exposed-form, .facets-selector, .submit-wrapper").addClass("on");
      });
    }
  };
  Drupal.behaviors.initFormSubmit = {
    attach: function attach(context, settings) {
      var $newSubmit = $("section.content-topper .submit-wrapper a.btn");
      $newSubmit.click(function (e) {
        var $form = $(this).parents("section.content-topper").find("form.views-exposed-form");

        e.preventDefault();
        $form.submit();
      });
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=search.js.map
