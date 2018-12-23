/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      const resultsCount = $("#main-container .views-view").data(
        "view-total-rows"
      );

      const $resetButton = $(
        "section.content-topper .submit-wrapper .btn-cta.reset"
      );

      const $selects = $("section.content-topper .selectpicker");

      const clearSelections = function () {
        $selects.selectpicker("deselectAll");
      };
      const showFilters = function () {
        $selects.parents(".dm-facets-selector").addClass("on");
      };
      const showFormControls = function () {
        $(".views-exposed-form, .submit-wrapper").addClass("on");
      };

      $selects.selectpicker();

      $selects.on("loaded.bs.select", () => {
        console.log('selects loaded');
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
    attach(context, settings) {
      const $searchForm = $("section.content-topper form.views-exposed-form");
      const $selectFilters = $("section.content-topper .selectpicker");
      const resultsCount = $("#main-container .views-view").data("view-total-rows");
      const $searchInput = $searchForm.find("input[name=s]");
      const inputVal = $searchInput.val();
      const $newSubmitButton = $(
        "section.content-topper .submit-wrapper a.btn-cta.submit"
      );

      const getSubmitUrl = function () {
        const opts = {s: $searchInput.val(), fs_p: [], f: []};

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

      $newSubmitButton.on("click", e => {
        e.preventDefault();
        window.location = getSubmitUrl();
      });

      $searchForm.on("submit", e => {
        e.preventDefault();
        $newSubmitButton.trigger("click");
      });

      $searchInput.keypress(e => {
        if (e.which == 13) {
          $newSubmitButton.trigger("click");
        }
      });

      $selectFilters.on("loaded.bs.select", () => {
        $("section.content-topper button.btn.dropdown-toggle").keydown(e => {
          if (e.which == 13) {
            $newSubmitButton.trigger("click");
          }
        });
      });

    }
  };
})(jQuery, Drupal);
