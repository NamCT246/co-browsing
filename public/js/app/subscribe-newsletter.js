define(["jquery"], function ($) {
    // Show cart by clicking
    $("#btn-show-menu").click(function () {
        console.log("show menu");
        if ($("#navigation-wrapper").hasClass("show-menu")) {
            $("#navigation-wrapper").removeClass("show-menu");
        } else {
            $("#navigation-wrapper").addClass("show-menu");
        }
    });

    // Show menu by cliking
    $("#btn-show-cart").click(function () {
        console.log("show cart");
        if ($("#cart-items").hasClass("show-cart")) {
            $("#cart-items").removeClass("show-cart");
        } else {
            $("#cart-items").addClass("show-cart");
        }
    });

    $("#subscribe-newsletter").click(function () {
        var postData,
            inputValue = $("#email-input").val();

        if (inputValue === "") {
            console.log("Do nothing");
        } else {
            showNotification("loading");
            subscribe_newsletter({
                email: inputValue
            });
        }
    });

    function subscribe_newsletter(postData) {
        $.ajax({
                method: 'GET',
                url: 'http://frontend-candidate.vaimo.com/nguyen.thanh/public/newsletter/subscribe',
                dataType: 'json',
                data: postData
            })
            .done(function (res) {
                if (res.message === "Valid email.") {
                    // Delay 1 second for showing "loading" notification.
                    setTimeout(function () {
                        showNotification("success");
                    }, 1000);
                }
            })
            .fail(function (err) {
                if (err.responseJSON && err.responseJSON.message === "Invalid email.") {
                    // Delay 1 second for showing "loading" notification.
                    setTimeout(function () {
                        showNotification("fail");
                    }, 1000);
                }
            });
    }

    function showNotification(option) {
        var notificationHtml;

        // Show appropriate notification based on parameter "option"
        if (option === "loading") {
            notificationHtml =
                '<div class="subscribe-notification-loading">\
                    <span class="notification-icon">\
                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>\
                    </span>\
                    <span class="notification-text">\
                        Subscribing to newsletter.\
                    </span>\
                </div>';
        } else if (option === "success") {
            notificationHtml =
                '<div class="subscribe-notification-success">\
                    <span class="notification-icon">\
                        <i class="fa fa-check" aria-hidden="true"></i>\
                    </span>\
                    <span class="notification-text">\
                        Subscription successful.\
                    </span>\
                </div>';

            // Empty the email input
            $('#email-input').val("");
        } else if (option === "fail") {
            notificationHtml =
                '<div class="subscribe-notification-fail">\
                    <span class="notification-icon">\
                        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>\
                    </span>\
                    <span class="notification-text">\
                        Email verification failed...\
                    </span>\
                </div>';

            // Empty the email input
            $('#email-input').val("");
        }

        $("#subscribe-notification").empty().html(notificationHtml);
    }
});