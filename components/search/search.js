/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      const $selects = $(".selectpicker");

      $selects.find("option").each((a, b) => {
        const val = $(b).val();
        const url = window.location.href;
        if (val.indexOf(url.replace(/%3A/g, ":")) > 0) {
          $(b).attr("selected", "selected");
          console.log("selected", val);
        }
      });

      $selects.selectpicker();
      $selects.on(
        "loaded.bs.select",
        (e, clickedIndex, isSelected, previousValue) => {
          $(
            ".views-exposed-form, .dm-facets-selector, .submit-wrapper"
          ).addClass("on");
        }
      );
    }
  };
  Drupal.behaviors.initFormSubmit = {
    attach(context, settings) {
      const submitUrl = function() {
        const opts = { s: $("input[name=s]").val(), fs_p: [] };

        $(".selectpicker")
          .find("option:selected")
          .each((f, g) => {
            const val = $(g).val();
            opts.fs_p.push(val);
          });

        return window.location.pathname + '?' + $.param(opts);
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      const $newSubmit = $("section.content-topper .submit-wrapper a.btn");
      $newSubmit.click(function(e) {
        // const $form = $(this)
        //   .parents("section.content-topper")
        //   .find("form.views-exposed-form");
        //
        // e.preventDefault();
        // $form.submit();
        $(this).attr("href", submitUrl());

      });
    }
  };
})(jQuery, Drupal);
