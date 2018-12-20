/**
 * @file
 * Custom global JavaScript for UW Medicine.
 */

(function ($, Drupal) {


    Drupal.behaviors.uwmedNavHover = {

        attach: function (context, settings) {

            var $mainNavDropdownItems = $('.uwm-main-navigation .dropdown');

            /**
             *
             *
             * Attach menu behavior
             *
             */

            // Toggle main drop-downs:
            $mainNavDropdownItems.hover(function (e) {
                //closeHoverMenus($(this));
                openHoverMenu($(this));

            }, function () {
                closeHoverMenus($(this));
            });

            // Hold open when clicked:
            $mainNavDropdownItems.click(function (e) {

                if (!isMenuClick($(e.target))) {
                    return;
                }

                e.stopPropagation(); // Prevent bubling to window close event
                e.preventDefault();

                closeHoverMenus($(this));

                // Tablets bind hover as touch, so don't duplicate:
                if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
                    return;
                }
                
                if($(this).hasClass('hold-open')) {
                    closeClickMenus($(this));
                } else {
                    openClickMenu($(this));
                }
            });

        //     // Open 3rd level menus:
        //     $secondaryMenus.click(function (e) {

        //         if (!isMenuClick($(e.target))) {
        //             return;
        //         }

        //         e.stopPropagation(); // Prevent bubling to window close event
        //         e.preventDefault();

        //         openClickMenu($(this));

        //     });

        //     // Close all menus:
        //     $(window).click(function (e) {
        //         closeClickMenus();
        //         closeHoverMenus();
        //     });


        //     /**
        //      *
        //      *
        //      * Show/ hide functions
        //      *
        //      */
            function openClickMenu($item) {

                $mainNavDropdownItems.find('.dropdown-menu').removeClass('show');
                $mainNavDropdownItems.removeClass('hold-open').removeClass('show');
                $item.addClass('show').addClass('hold-open').removeClass('hover');
                $item.find('.dropdown-menu').addClass('show');

            }

            function closeClickMenus($exceptThis) {
                $exceptThis.removeClass('show').removeClass('hold-open');
                $mainNavDropdownItems.find('.dropdown-menu').removeClass('show');
            }

            function openHoverMenu($item) {

                $item.stop(true, true).addClass('show').addClass('hover');
                $item.find('.dropdown-menu').addClass('show');
            }

            function closeHoverMenus($item) {
                if($item.hasClass('hold-open')) {
                    $item.removeClass('hover');
                } else {
                    $item.removeClass('show').removeClass('hover');
                    $item.find('.dropdown-menu').removeClass('show');
                }
            }

            function isMenuClick($item) {

                if ($item.hasClass('dropdown-toggle') || $item.is($mainNavDropdownItems)) {
                    return true;
                }

                return false;

            }

        }

    };


    Drupal.behaviors.uwHeaderSearchClick = {

        attach: function (context, settings) {

            $('header form i.fa.fa-search').click(function (e) {

                $(this).parents('form').first().submit();

            });

            $('header.mobile button[data-target=".search-collapse"]').click(function (e) {

                $('header.mobile input[name="s"]').val('');

            });
        }
    };


})(jQuery, Drupal);
