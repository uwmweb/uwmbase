/**
 * @file
 * Custom JavaScript for UW Medicine.
 */
//
// (function ($, Drupal) {
//
//   Drupal.behaviors.uwmSearchLayout = {
//
//     attach: function (context, settings) {
//
//       var searchResults = settings.uwm_locations_search_api_index || {};
//       var markers = [];
//
//       var locationsMap = $(".search-results-map #map", context).gmap3({
//         center: [47.609722, -122.333056],
//         zoom: 12,
//         mapTypeId: google.maps.MapTypeId.ROADMAP,
//         key: "AIzaSyAdY8R5lQPdDO_ffF9WADgbYVsYmpfv3Vw"
//       });
//
//       $.each(searchResults, function (b) {
//
//         var obj = {
//           position: [b["lat"], b["lon"]],
//           label: b["title"],
//           icon: "https//maps.google.com/mapfiles/marker_green.png",
//           content: "<em>" + b["title"] + "</em>"
//         };
//
//         let marker = locationsMap.marker(obj);
//
//         marker.on("click", function (marker, event) {
//           marker.setIcon("http://maps.google.com/mapfiles/marker_orange.png");
//           setTimeout(function () {
//             marker.setIcon("http://maps.google.com/mapfiles/marker_green.png");
//             console.log(marker);
//           }, 200);
//         });
//
//         markers.push(marker);
//
//       });
//
//       locationsMap.marker(markers);
//
//       locationsMap.cluster({
//         size: 200,
//         markers,
//         cb: function (markers) {
//           if (markers.length > 1) {
//             // 1 marker stay unchanged (because cb returns nothing)
//             if (markers.length < 20) {
//               return {
//                 content: '<div class="cluster cluster-1">' + markers.length + '</div>',
//                 x: -26,
//                 y: -26
//               };
//             }
//           }
//         }
//       });
//     }
//   };
//
// })(jQuery, Drupal);
