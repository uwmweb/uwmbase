'use strict';

(function (Drupal, $) {
    $(document).ready(function () {
        var modalHTML = '<div class="modal fade js-modal-video" tabindex="-1" role="dialog" aria-label="Video player" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-centered" role="document"><div class="modal-content"><div class="modal-body p-0"><button type="button" class="close p-0 border-0 text-primary" data-dismiss="modal" aria-label="Close"><i class="fas fa-times-circle" data-fa-transform="grow-16"></i></button><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item js-modal-video-iframe" src="" allowscriptaccess="always"></iframe></div></div></div></div></div>';
        // append the modal html to body
        $(modalHTML).appendTo('body');
        // Gets the video src from the data-src on each button
        var $videoSrc;
        $('.js-modal-video-btn').click(function () {
            $videoSrc = $(this).data('src');
        });

        // when the modal is opened autoplay it  
        $('.js-modal-video').on('shown.bs.modal', function (e) {
            // set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
            $(".js-modal-video-iframe").attr('src', $videoSrc);
        });

        // stop playing the youtube video when I close the modal
        $('.js-modal-video').on('hide.bs.modal', function (e) {
            // remove current video
            $(".js-modal-video-iframe").attr('src', '');
        });

        // document ready  
    });
})(Drupal, jQuery);
//# sourceMappingURL=modal-video.js.map
