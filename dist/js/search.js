"use strict";

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach: function attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      var $selects = $(".selectpicker");

      $selects.find("option").each(function (a, b) {
        var val = $(b).val();
        var url = window.location.href;
        if (val.indexOf(url.replace(/%3A/g, ":")) > 0) {
          $(b).attr("selected", "selected");
          console.log("selected", val);
        }
      });

      $selects.selectpicker();
      $selects.on("loaded.bs.select", function (e, clickedIndex, isSelected, previousValue) {
        $(".views-exposed-form, .dm-facets-selector, .submit-wrapper").addClass("on");
      });
    }
  };
  Drupal.behaviors.initFormSubmit = {
    attach: function attach(context, settings) {
      var submitUrl = function submitUrl() {
        var opts = { s: $("input[name=s]").val(), fs_p: [] };

        $(".selectpicker").find("option:selected").each(function (f, g) {
          var val = $(g).val();
          opts.fs_p.push(val);
        });

        return window.location.pathname + '?' + $.param(opts);
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      var $newSubmit = $("section.content-topper .submit-wrapper a.btn");
      $newSubmit.click(function (e) {
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
//# sourceMappingURL=search.js.map
