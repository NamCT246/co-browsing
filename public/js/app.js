$(document).ready(function () {
    
    /**
     * Connect to the websocket server
     */
    var socket = io.connect('http://localhost:9999');

    /**
     * Mouse move handlers
     */

    // listen to local "mouse move" event.
    $(document).on("mousemove", function(event) {
        socket.emit('mouseMove', { mouseX: event.pageX, mouseY: event.pageY });
    });

    // Waiting for "mouse move" from other clients.
    socket.on('onMouseMove', function (data) {
        showMouseMove(data);
    });

    function showMouseMove(data) {
        mover = $(document.createElement('div'))
            .addClass('cursor')
            .css({
                'background-color': '#000',
                'left': data.mouseMoveData.mouseX,
                'top': data.mouseMoveData.mouseY
            })
            .html('&nbsp;');
        $(document.body).append(mover);
        mover.fadeOut(300, function() { 
            $(this).remove(); 
        });
    }

    /**
     * Mouse click handlers
     */

    // listen to local "mouse click" event.
    $(document).on("click", function(event) {
        event.stopPropagation();
        // var target = $(event.target);
        console.log(elementLocation(event.target));
        socket.emit('mouseClick', {
            pageX: event.pageX,
            pageY: event.pageY,
            target: elementLocation(event.target)
        });
    });

    // Waiting for "mouse click" from other clients.
    socket.on('onMouseClick', function (data) {
        showMouseClick(data);
        triggerClick(data);
    });

    function showMouseClick(data) {
        clicker = $(document.createElement('div'))
            .addClass('cursor-click')
            .css({
                'background-color': 'yellow',
                'left': data.mouseClickData.pageX,
                'top': data.mouseClickData.pageY
            })
            .html('&nbsp;');
        $(document.body).append(clicker);
        clicker.fadeOut(300, function() { 
            $(this).remove(); 
        });
    }

    function triggerClick(data) {
        console.log(data.mouseClickData);
        console.log(data.mouseClickData.target);
        // $(data.mouseClickData.target).trigger("click");
    }

    function elementLocation(el) {
        if (el instanceof $) {
            // a jQuery element
            el = el[0];
        }
        if (el[0] && el.attr && el[0].nodeType == 1) {
            // Or a jQuery element not made by us
            el = el[0];
        }
        if (el.id) {
            return "#" + el.id;
        }
        if (el.tagName == "BODY") {
            return "body";
        }
        if (el.tagName == "HEAD") {
            return "head";
        }
        if (el === document) {
            return "document";
        }
        var parent = el.parentNode;
        if ((!parent) || parent == el) {
            console.warn("elementLocation(", el, ") has null parent");
            throw new Error("No locatable parent found");
        }
        var parentLocation = elementLocation(parent);
        var children = parent.childNodes;
        var _len = children.length;
        var index = 0;
        for (var i = 0; i < _len; i++) {
            if (children[i] == el) {
                break;
            }
            if (children[i].nodeType == document.ELEMENT_NODE) {
                if (children[i].className.indexOf("togetherjs") != -1) {
                    // Don't count our UI
                    continue;
                }
                // Don't count text or comments
                index++;
            }
        }
        return parentLocation + ":nth-child(" + (index + 1) + ")";
    };

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
