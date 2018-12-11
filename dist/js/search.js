'use strict';

/**
 * @file
 * Custom JavaScript for UW Medicine.
 */

(function ($, Drupal) {
  Drupal.behaviors.uwHeaderSearchClick = {
    attach: function attach(context, settings) {

      var typeAhead = function ($, window, undefined) {
        var $container = $('.dropdown-menu'),
            $list = $('.dropdown-menu ul'),
            $listItems = $list.find('li'),
            $title = $('.title'),
            $typeahead = $('#js-typeAhead');

        return {
          clearSelectedListItem: function clearSelectedListItem() {
            $('.is-selected').removeClass('is-selected');
          },
          closeMenu: function closeMenu(el) {
            $(el).closest('.dropdown').toggleClass('closed');
            $container.css('height', 0);
            $list.css('top', 30);
          },
          filterList: function filterList(filterString) {
            var val = new RegExp(filterString, 'gi');

            for (var i = 0; i < $listItems.length; i++) {
              var $item = $($listItems[i]);

              if (filterString.length > 0) {
                var name = $item.data('name');

                if (name && !name.match(val)) {
                  $item.addClass('is-hidden');
                } else {
                  $item.removeClass('is-hidden');
                }
                this.selectFirstListItem();
              } else {
                $item.removeClass('is-hidden');
                this.clearSelectedListItem();
              }
            }
          },
          hideListItem: function hideListItem($item) {
            $item.addClass('is-hidden');
          },
          openMenu: function openMenu(el) {
            $(el).parent().toggleClass('closed');
            $container.css({
              height: 200
            });
            $('#js-typeAhead').focus();
          },
          selectFirstListItem: function selectFirstListItem() {
            this.clearSelectedListItem();
            $listItems.not('.is-hidden').eq(0).addClass('is-selected');
          },
          selectListItem: function selectListItem() {
            $title.html($listItems.filter('.is-selected').html());
            this.closeMenu($list);
          },
          selectListItemAtIndex: function selectListItemAtIndex(index) {
            this.clearSelectedListItem();
            $listItems.eq(index).addClass('is-selected');
            this.updateListPosition(index);
          },
          selectNextListItem: function selectNextListItem() {
            var index = $listItems.hasClass('is-selected') && $listItems.filter('.is-selected').index() + 1 || 0;
            this.selectListItemAtIndex(index);
          },
          selectPreviousListItem: function selectPreviousListItem() {
            var index = $listItems.hasClass('is-selected') && $listItems.filter('.is-selected').index() - 1 || 0;
            this.selectListItemAtIndex(index);
          },
          showListItem: function showListItem($item) {
            $item.removeClass('is-hidden');
          },
          updateListPosition: function updateListPosition(index) {
            var rel = $container.outerHeight() - $listItems.eq(index).position().top - 50;

            if (rel < 30) {
              $list.css('top', rel);
            } else if ($list.position().top - $listItems.eq(index).position().top < 30) {
              $list.css('top', 30);
            }
          },
          registerEvents: function registerEvents() {
            var self = this;
            $('.dropdown .title').click(function () {
              if ($container.height() > 0) {
                self.closeMenu(this);
              } else {
                self.openMenu(this);
              }
            });

            $('.dropdown-menu li').click(function () {
              if ($(this).index() > 0) {
                $title.html($(this).html());
                self.closeMenu(this);
              }
            });

            $typeahead.on('keyup', function (e) {
              // 40 = down arrow
              // 38 = up arrow
              // 8 = backspace
              if (e.keyCode === 40) {
                self.selectNextListItem();
              } else if (e.keyCode === 38) {
                self.selectPreviousListItem();
              } else if (e.keyCode === 13) {
                self.selectListItem();
              } else if (e.keyCode >= 65 || e.keyCode === 8) {
                self.filterList(e.target.value);
              }
            });
          }
        };
      }(jQuery, window, undefined);

      typeAhead.registerEvents();
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=search.js.map
