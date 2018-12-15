'use strict';

/**
 * @file
 * Javascript for the /provider-resource page.
 */

(function ($, Drupal) {

    Drupal.behaviors.uwmedProviderResourcesLinkGenerator = {

        attach: function attach(context, settings) {

            var filterElement = $('.view-filters');
            if (filterElement.length == 0) {
                // if there's a view <header> element we lost our views-header and views-filter divs
                // let's add them back in
                $('.views-exposed-form.bef-exposed-form').wrap('<div class="view-filters"></div>');
            }
            $('.js-share-search').insertAfter('.view-filters');
            $('.js-filter-heading').prependTo('.view-filters');

            // update the query string when a user clicks a filter so we can maintain the selections if the user navigates to a resource
            // and then pushes back to return to the filter
            $('#views-exposed-form-uwm-provider-resources-uwm-provider-resources-block label').on('click', function (event) {
                var input = $(event.target).parent().prev();
                var querystring = generateQueryString(input[0]);
                history.pushState(null, '', [location.pathname, querystring].join(''));
            });

            function generateQueryString() {
                var clicked = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                var checked = $('#views-exposed-form-uwm-provider-resources-uwm-provider-resources-block input[checked=checked]');

                var querystring = '?';

                $.each(checked, function (index, element) {
                    if (clicked && element.name == clicked.name) {
                        querystring += clicked.name + '=' + clicked.value;
                    } else {
                        querystring += element.name + '=' + element.value;
                    }

                    if (checked[index + 1]) {
                        querystring += '&';
                    } else {
                        querystring += '#filter';
                    }
                });
                return querystring;
            }

            // inspired by https://gist.github.com/Chalarangelo/4ff1e8c0ec03d9294628efbae49216db#file-copytoclipboard-js
            function copyToClipboard(str) {
                var el = document.createElement('textarea'); // Create a <textarea> element
                el.value = str; // Set its value to the string that you want copied
                el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
                el.style.position = 'absolute';
                el.style.left = '-9999px'; // Move outside the screen to make it invisible
                document.body.appendChild(el); // Append the <textarea> element to the HTML document
                var selected = document.getSelection().rangeCount > 0 // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0) // Store selection if found
                : false; // Mark as false to know no selection existed before
                el.select(); // Select the <textarea> content
                document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
                document.body.removeChild(el); // Remove the <textarea> element
                if (selected) {
                    // If a selection existed before copying
                    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
                    document.getSelection().addRange(selected); // Restore the original selection
                }
            };

            $('.js-link-copy').on('click', function (e) {
                var querystring = generateQueryString();
                var url = [location.origin, location.pathname, querystring].join('');
                copyToClipboard(url);
                $(e.target).text('Link copied!');
            });

            // add view more collapsibles around result groups
            var $groups = $('.views-view-grid');
            $groups.each(function (index, element) {
                var heading = element.previousElementSibling;
                console.log(heading.innerText + ' has ' + $(element).children('.card-deck').length + ' rows.');

                if ($(element).children('.card-deck').length > 2) {
                    var collapsedElements = $(element).children(':nth-child(n+3)');
                    var collapseWrap = $.parseHTML('<div class="collapse" id="viewMoreCollapse' + heading.innerText + '"></div>');
                    var collapseAfter = $.parseHTML('<p><a aria-controls="viewMoreCollapse' + heading.innerText + '" aria-expanded="false" class="view-more-link collapsed" data-target="#viewMoreCollapse' + heading.innerText + '" data-toggle="collapse" role="button">View More</a></p>');
                    $(collapsedElements).wrapAll(collapseWrap);
                    var collapseContainer = $(collapsedElements).parent();
                    $(collapseAfter).insertAfter(collapseContainer);
                }
            });

            // make sure the view more events are added to our dynamically created view more elements
            Drupal.behaviors.toggleViewMoreText.attach();

            var specialtyInfo1 = '<div class="provider-resource-specialty"><h3>';
            var specialtyInfo2 = '</h3>';
            var specialtyInfo3 = '</div>';
            var specialties = drupalSettings['specialtyDescriptions'];

            // $('.form-item-specialty label.option').on('click', function(){
            //     var id = $(this).attr('for').split('edit-specialty-')[1];
            //     console.log(id);
            // })

            var id = $('.form-item-specialty .btn-teal label').attr('for').split('edit-specialty-')[1].split('-')[0];
            var element = specialtyInfo1 + specialties[id].name + specialtyInfo2;
            if (specialties[id].description) {
                var element = element + specialties[id].description;
            }
            var element = element + specialtyInfo3;
            $(element).insertAfter('.js-share-search');
            var spec = $('.provider-resource-specialty');
            if (spec.length > 1) {
                $('.provider-resource-specialty')[1].remove();
            }
        }
    };
})(jQuery, Drupal);
//# sourceMappingURL=provider-resource-view.js.map
