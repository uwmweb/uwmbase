'use strict';

(function (Drupal, $) {
    $(document).ready(function () {
        // stop playing the video when the modal closes by resetting the iframe src
        $(".uwm-modal-video .modal").on('hidden.bs.modal', function (e) {
            var $this = $(this);
            var $iframe = $this.find('iframe');
            $iframe.attr("src", $iframe.attr("src"));
        });
    });
})(Drupal, jQuery);
//# sourceMappingURL=modal-video.js.map
