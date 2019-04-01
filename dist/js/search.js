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

      // const $resetButton = $(
      //   "section.content-topper .submit-wrapper .btn-cta.reset"
      // );

      var $selects = $("section.content-topper .selectpicker");

      var clearSelections = function clearSelections() {
        $selects.selectpicker("deselectAll");
      };

      // const showFilters = function () {
      //   $selects.parents(".dm-facets-selector").addClass("on");
      // };
      //
      // const showFormControls = function () {
      //   $(".views-exposed-form, .submit-wrapper").addClass("on");
      // };

      $selects.selectpicker();
      //
      // $selects.on("loaded.bs.select", () => {
      //   // console.log('selects loaded');
      // });

      if (resultsCount < 1) {
        clearSelections();
      }
    }
  };

  Drupal.behaviors.initSearchForm = {
    attach: function attach(context, settings) {
      var $container = $("section.content-topper");
      var $searchForm = $container.find("form.views-exposed-form");
      var $selectFilters = $container.find(".selectpicker, .dm-facets-widget-checkbox");
      var resultsCount = $("#main-container .views-view").data("view-total-rows");
      var $searchInput = $searchForm.find("input[name=s]");
      var inputVal = $searchInput.val();
      var $umlInput = $searchForm.find("input[name=uml]");
      var $addressInput = $searchForm.find("input[name=l]");
      var optionsValues = $container.find("option:selected, input:checked").map(function () {
        return $(this).val();
      }).get();

      var $newSubmitButton = $container.find(".submit-wrapper a.btn-cta.submit");

      var getSubmitUrl = function getSubmitUrl() {
        var opts = { s: $searchInput.val(), fs_p: [], f: [] };
        $selectFilters.find("option:selected, input:checked").each(function (f, g) {
          var val = $(g).val();
          if (val.length > 0) {
            if ($selectFilters.length > 1) {
              opts.fs_p[opts.fs_p.length] = val;
            } else {
              opts.f[opts.f.length] = val;
            }
          }
        });

        // Add the value from the UML field, if it's available.
        if ($umlInput.length > 0 && $umlInput.val() != '') {
          opts.uml = $umlInput.val();
        }
        // Add the value from the UML field, if it's available.
        if ($addressInput.length > 0 && $addressInput.val() != '') {
          opts.l = $addressInput.val();
        }

        return window.location.pathname + "?" + $.param(opts);
      };

      // http://stevie.uwmed.local/search/providers?fs_p[0]=language:15391&fs_p[1]=medical-service:506&fs_p[2]=medical-service:1321

      $searchInput.attr("autocomplete", "off");

      if (resultsCount > 0) {
        $("body").addClass("search-with-results");
      } else {
        $("body").addClass("search-without-results");
      }

      if (inputVal.length > 0) {
        $("section.content-topper .search-results-msg em").text("'" + inputVal + "' (" + resultsCount + ")");
        // $("body").addClass("search-with-string");
      }

      $newSubmitButton.one("click", function (e) {
        e.preventDefault();
        // if any ajax calls are active, wait for them to complete
        if ($.active) {
          $(document).bind("ajaxComplete", function () {
            window.location = getSubmitUrl();
          });
        } else {
          window.location = getSubmitUrl();
        }
      });

      $searchForm.on("submit", function (e) {
        e.preventDefault();
        $newSubmitButton.trigger("click");
      });

      $searchInput.keypress(function (e) {
        $("body").addClass("search-filters-changed");
        if (e.which === 13) {
          $newSubmitButton.trigger("click");
        }
      });

      $addressInput.keypress(function (e) {
        $("body").addClass("search-filters-changed");
        if (e.which === 13) {
          $addressInput.blur();
          $newSubmitButton.trigger("click");
        }
      });

      $selectFilters.on("loaded.bs.select", function () {
        $("section.content-topper button.btn.dropdown-toggle").keydown(function (e) {
          if (e.which === 13) {
            $newSubmitButton.trigger("click");
          }
        });
      });

      $selectFilters.on("changed.bs.select", function () {
        $("body").addClass("search-filters-changed");
      });

      $(document).ready(function () {
        if (inputVal.length > 0 || optionsValues.length > 0) {
          $("body").addClass("search-with-query");
        }
        if (inputVal.length > 1) {
          $("body").addClass("search-with-term");
        } else {
          $("body").addClass("search-without-term");
        }

        $("body").addClass("uwmbase-search-js");
      });

      $(".search-checkbox").focus(function (e) {
        $(e.target).addClass("active");
      });

      $(".search-checkbox").blur(function (e) {
        $(e.target).removeClass("active");
      });
    }
  };

  Drupal.behaviors.getResultsCounts = {
    attach: function attach(context, settings) {
      var searchString = $("body.path-search section.content-topper form.views-exposed-form input[name=s]").val();
      var $providersLink = $("body.path-search section.content-topper .other-search-pages .providers a");
      var $locationsLink = $("body.path-search section.content-topper .other-search-pages .locations a");
      // let providersCount = 0;
      // let locationsCount = 0;
      //
      // const getAlternateSearchCount = function (uri) {
      //   $.ajax({
      //     url: uri,
      //     type: "GET",
      //     success(data) {
      //       return (function () {
      //         const n = $(data)
      //           .find(".views-element-container > .view")
      //           .attr("data-view-total-rows");
      //         setCounts(uri, n);
      //       })(data, uri);
      //     }
      //   });
      // };
      //
      // var setCounts = function (link, count) {
      //   if (count && count.length > 0) {
      //     if (link.indexOf("providers") > -1) {
      //       providersCount = count;
      //     } else if (link.indexOf("locations") > -1) {
      //       locationsCount = count;
      //     }
      //   }
      //
      //   // Only show count if search results:
      //   if (providersCount > 0) {
      //     $providersLink.text(`Search Providers (${providersCount}) >`);
      //   }
      //   if (locationsCount > 0) {
      //     $locationsLink.text(`Search Locations (${locationsCount}) >`);
      //   }
      // };

      if (searchString && searchString.length > 0) {
        var href = "/search/providers?s=" + encodeURI(searchString);
        $providersLink.attr("href", href);
        // getAlternateSearchCount(href);

        var href = "/search/locations?s=" + encodeURI(searchString);
        $locationsLink.attr("href", href);
        // getAlternateSearchCount(href);
      }
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=search.js.map
