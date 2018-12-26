"use strict";

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach: function attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      var resultsCount = $("#main-container .views-view").data("view-total-rows");

      var $resetButton = $("section.content-topper .submit-wrapper .btn-cta.reset");

      var $selects = $("section.content-topper .selectpicker");

      var clearSelections = function clearSelections() {
        $selects.selectpicker("deselectAll");
      };

      var showFilters = function showFilters() {
        $selects.parents(".dm-facets-selector").addClass("on");
      };

      var showFormControls = function showFormControls() {
        $(".views-exposed-form, .submit-wrapper").addClass("on");
      };

      $selects.selectpicker();

      $selects.on("loaded.bs.select", function () {
        // console.log('selects loaded');
      });

      if (resultsCount > 0) {
        $resetButton.removeClass("on");
        showFilters();
      } else {
        $resetButton.addClass("on");
        clearSelections();
      }

      $(document).ready(showFormControls);
    }
  };
  Drupal.behaviors.initSearchForm = {
    attach: function attach(context, settings) {

      var $searchForm = $("section.content-topper form.views-exposed-form");
      var $selectFilters = $("section.content-topper .selectpicker");
      var resultsCount = $("#main-container .views-view").data("view-total-rows");
      var $searchInput = $searchForm.find("input[name=s]");
      var inputVal = $searchInput.val();
      var $newSubmitButton = $("section.content-topper .submit-wrapper a.btn-cta.submit");

      var getSubmitUrl = function getSubmitUrl() {
        var opts = { s: $searchInput.val(), fs_p: [], f: [] };

        $selectFilters.find("option:selected").each(function (f, g) {
          var val = $(g).val();
          if (val.length > 0) {
            if ($selectFilters.length > 1) {
              opts.fs_p[opts.fs_p.length] = val;
            } else {
              opts.f[opts.f.length] = val;
            }
          }
        });

        return window.location.pathname + "?" + $.param(opts);
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      $searchInput.attr("autocomplete", "off");

      if (inputVal.length > 0) {
        $("section.content-topper .results-tip.with-results em").text(inputVal + " (" + resultsCount + ")");
        $(".results-tip.zero-results").addClass("hidden");
        $(".results-tip.with-results").removeClass("hidden");
      }

      $newSubmitButton.on("click", function (e) {
        e.preventDefault();
        window.location = getSubmitUrl();
      });

      $searchForm.on("submit", function (e) {
        e.preventDefault();
        $newSubmitButton.trigger("click");
      });

      $searchInput.keypress(function (e) {
        if (e.which == 13) {
          $newSubmitButton.trigger("click");
        }
      });

      $selectFilters.on("loaded.bs.select", function () {
        $("section.content-topper button.btn.dropdown-toggle").keydown(function (e) {
          if (e.which == 13) {
            $newSubmitButton.trigger("click");
          }
        });
      });
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=search.js.map
