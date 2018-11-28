'use strict';

/**
 * @file
 * Javascript for the /provider-resource page.
 */

(function ($, Drupal) {

    Drupal.behaviors.uwmedProviderResourcesLinkGenerator = {

        attach: function attach(context, settings) {
            function generateLink() {
                var checked = $('#views-exposed-form-uwm-provider-resources-uwm-provider-resources-block input[checked=checked]');
                var querystring = '?';

                $.each(checked, function (index, element) {
                    querystring += element.name + '=' + element.value;
                    if (checked[index + 1]) {
                        querystring += '&';
                    } else {
                        querystring += '#filter';
                    }
                });

                var url = [location.protocol, '//', location.host, location.pathname, querystring].join('');
                return url;
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
                var url = generateLink();
                copyToClipboard(url);
                $(e.target).text('Link copied!');
            });
        }
    };
})(jQuery, Drupal);
//# sourceMappingURL=provider-resources.js.map