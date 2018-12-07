/**
 * @file
 * Custom global JavaScript for UW Medicine.
 */

(function ($, Drupal) {


    Drupal.behaviors.uwmedNavHover = {

        attach: function (context, settings) {

            var $menu = $('header .desktop-main-navigation .navbar-collapse > ul.nav');
            var $primaryMenus = $menu.find('> li.dropdown');
            var $secondaryMenus = $primaryMenus.find('li.dropdown-submenu');


            /**
             *
             *
             * Attach menu behavior
             *
             */

            // Toggle main drop-downs:
            $primaryMenus.hover(function (e) {

                closeHoverMenus();
                openHoverMenu($(this));

            }, function () {

                closeHoverMenus();

            });

            // Hold open when clicked:
            $primaryMenus.click(function (e) {

                if (!isMenuClick($(e.target))) {
                    return;
                }

                e.stopPropagation(); // Prevent bubling to window close event
                e.preventDefault();

                closeHoverMenus();

                // Tablets bind hover as touch, so don't duplicate:
                if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
                    return;
                }

                closeClickMenus($(this));
                openClickMenu($(this));


            });

            // Open 3rd level menus:
            $secondaryMenus.click(function (e) {

                if (!isMenuClick($(e.target))) {
                    return;
                }

                e.stopPropagation(); // Prevent bubling to window close event
                e.preventDefault();

                openClickMenu($(this));

            });

            // Close all menus:
            $(window).click(function (e) {
                closeClickMenus();
                closeHoverMenus();
            });


            /**
             *
             *
             * Show/ hide functions
             *
             */
            function openClickMenu($item) {

                $item.toggleClass('uw-hold-open');

            }

            function closeClickMenus($exceptThis) {

                $menu.find('ul, li').not($exceptThis)
                    .removeClass('uw-hold-open');
            }

            function openHoverMenu($item) {

                $item.stop(true, true).addClass('uw-open');

            }

            function closeHoverMenus($exceptThis) {

                $menu.find('ul, li').not($exceptThis)
                    .removeClass('open uw-open');

            }

            function isMenuClick($item) {

                if ($item.hasClass('dropdown-toggle') || $item.is($primaryMenus) || $item.is($secondaryMenus)) {
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

                $('header.mobile input[name="k"]').val('');

            });
        }
    };


})(jQuery, Drupal);
