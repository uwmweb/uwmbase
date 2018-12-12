/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function($, Drupal) {
  Drupal.behaviors.setupSearchFacets = {
    attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      const $selects = $(".selectpicker");
      $selects.selectpicker();
      $selects.on(
        "loaded.bs.select",
        (e, clickedIndex, isSelected, previousValue) => {
          $(".views-exposed-form, .facets-selector, .submit-wrapper").addClass(
            "on"
          );
        }
      );
    }
  };
  Drupal.behaviors.initFormSubmit = {
    attach(context, settings) {
      const $newSubmit = $("section.content-topper .submit-wrapper a.btn");
      $newSubmit.click(function(e) {
        const $form = $(this)
          .parents("section.content-topper")
          .find("form.views-exposed-form");

        e.preventDefault();
        $form.submit();
      });
    }
  };
})(jQuery, Drupal);
