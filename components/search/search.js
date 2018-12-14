/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      const resultsCount = $("#main-container .views-view").data(
        "view-total-rows"
      );

      const $selects = $(".selectpicker");

      const clearSelections = function() {
        $selects.selectpicker("deselectAll");
      };
      const showFilters = function() {
        $selects.parents(".dm-facets-selector").addClass("on");
      };
      const showFormControls = function() {
        $(".views-exposed-form, .submit-wrapper").addClass("on");
      };

      const setActiveItems = function() {
        $selects.each((j, k) => {
          const $selectpicker = $(k);
          const options = [];
          $selectpicker.find("option").each((a, b) => {
            const val = $(b).val();
            const url = window.location.href.replace(/%3A/g, ":");
            if (url.indexOf(val) > 0) {
              // $(b).attr("selected", "selected");
              options.push(val);
            }
          });
          $selectpicker.selectpicker("val", options);
        });
      };

      $selects.selectpicker();

      $selects.on("loaded.bs.select", () => {
        setActiveItems();
      });

      if (resultsCount == 0) {
        clearSelections();
      }

      if (resultsCount > 0) {
        showFilters();
      }



      $(document).ready(showFormControls);
    }
  };
  Drupal.behaviors.initSearchForm = {
    attach(context, settings) {
      const $searchForm = $("section.content-topper form.views-exposed-form");
      const $searchInput = $searchForm.find("input[name=s]");
      const $selectFilters = $("section.content-topper .selectpicker");
      const inputVal = $searchInput.val();
      const resultsCount = $("#main-container .views-view").data(
        "view-total-rows"
      );

      const $newSubmitButton = $(
        "section.content-topper .submit-wrapper a.btn"
      );

      const getSubmitUrl = function() {
        const opts = { s: $searchInput.val(), fs_p: [], f: [] };

        $selectFilters.find("option:selected").each((f, g) => {
          const val = $(g).val();
          if (val.length > 0) {
            if ($selectFilters.length > 1) {
              opts.fs_p[opts.fs_p.length] = val;
            } else {
              opts.f[opts.f.length] = val;
            }
          }
        });

        return `${window.location.pathname}?${$.param(opts)}`;
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      $searchInput.attr("autocomplete", "off");

      if (inputVal.length > 0) {
        $("section.content-topper .results-tip.with-results em").text(
          `${inputVal} (${resultsCount})`
        );
        $(".results-tip.zero-results").addClass("hidden");
        $(".results-tip.with-results").removeClass("hidden");
      }

      $newSubmitButton.click(function() {
        $(this).attr("href", getSubmitUrl());
      });

      $searchForm.on("submit", e => {
        e.preventDefault();
        $newSubmitButton.trigger("click");
      });
    }
  };
})(jQuery, Drupal);
