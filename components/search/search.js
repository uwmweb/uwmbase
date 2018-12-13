/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.initSearchFacets = {
    attach(context, settings) {
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";

      const $selects = $(".selectpicker");

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

      const showFilters = function () {
        $(".views-exposed-form, .dm-facets-selector, .submit-wrapper").addClass(
          "on"
        );
      };

      $selects.selectpicker();
      $selects.on(
        "loaded.bs.select",
        (e, clickedIndex, isSelected, previousValue) => {
          showFilters();
        }
      );
      $(document).ready(showFilters);
    }
  };
  Drupal.behaviors.initSearchForm = {
    attach(context, settings) {
      const $searchForm = $("section.content-topper form.views-exposed-form");
      const $searchInput = $searchForm.find("input[name=s]");
      const $selectFilters = $("section.content-topper .selectpicker");
      const $newSubmitButton = $("section.content-topper .submit-wrapper a.btn");

      const getSubmitUrl = function () {
        const opts = {s: $searchInput.val(), fs_p: [], f: []};

        $selectFilters.find("option:selected").each((f, g) => {
          const val = $(g).val();
          if (val.length > 0) {
            if ($selectFilters.length > 1) {
              opts.fs_p[opts.fs_p.length] = val;
            }
            else {
              opts.f[opts.f.length] = val;
            }
          }
        });

        return `${window.location.pathname}?${$.param(opts)}`;
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      $searchInput.attr("autocomplete", "off");

      $searchForm.on("submit", e => {
        e.preventDefault();
        $newSubmitButton.trigger("click");
      });

      const s = $searchInput.val();
      if (s.length > 0) {
        $("section.content-topper .all em").text(s);
        $(".results-tip.zero-results").addClass("hidden");
        $(".results-tip.with-results").removeClass("hidden");
      }

      $newSubmitButton.click(function () {
        $(this).attr("href", getSubmitUrl());
      });
    }
  };
})(jQuery, Drupal);
