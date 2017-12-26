define(["require", "jquery", "scrollTo", "socket", "elementFinder", "eventMaker"], function (require, $, scrollTo, socket, elementFinder, eventMaker) {

    require(["subscribe-newsletter"]);

    $(document).ready(function () {

        /************************************
         * Connect to the signalling server *
         ************************************/

        socket.on('onUserDisconnected', function (data) {
            console.log("User ID: " + data.id + " has disconnected.");
            removeCursor(data.id);
        });

        function removeCursor(id) {
            var cursorId = "#cursor" + id;
            $(cursorId).remove();
        }

        /***********************
         * Mouse move handlers *
         ***********************/

        // Local "mouse move" event.
        $(document).mousemove(mousemove);

        var lastTime = 0,
            lastPosX = -1,
            lastPosY = -1,
            lastMessage = null,
            createdUsers = [];

        function mousemove(event) {
            var now = Date.now();
            lastTime = now;
            var pageX = event.pageX,
                pageY = event.pageY;
            if (Math.abs(lastPosX - pageX) < 3 && Math.abs(lastPosY - pageY) < 3) {
                // Not a substantial enough change
                return;
            }
            lastPosX = pageX;
            lastPosY = pageY;
            var target = event.target;
            // var parent = $(target).closest(".togetherjs-window, .togetherjs-popup, #togetherjs-dock");
            // if (parent.length) {
            //     target = parent[0];
            // } else if (elementFinder.ignoreElement(target)) {
            //     target = null;
            // }
            if ((!target) || target == document.documentElement || target == document.body) {
                lastMessage = {
                    type: "mouse-move",
                    top: pageY,
                    left: pageX
                };
                socket.emit('mouseMove', lastMessage);
                return;
            }
            target = $(target);
            var offset = target.offset();
            if (!offset) {
                console.warn("Could not get offset of element:", target[0]);
                return;
            }
            var offsetX = pageX - offset.left;
            var offsetY = pageY - offset.top;
            lastMessage = {
                type: "mouse-move",
                element: elementFinder.elementLocation(target),
                offsetX: Math.floor(offsetX),
                offsetY: Math.floor(offsetY)
            };
            socket.emit('mouseMove', lastMessage);
        }

        // Remote "mouse move" event.
        socket.on('onMouseMove', function (data) {
            if ($.inArray(data.id, createdUsers) === -1) {
                createCursor(data.id);
            }
            showMouseMove(data.mouseMoveData, data.id);
        });

        function createCursor(id) {
            createdUsers.push(id);
            var cursorId = 'cursor' + id;
            var cursor = $(document.createElement('div'))
                .attr('id', cursorId)
                .addClass('cursor')
                .css({
                    'background-color': '#000',
                    'left': '50%',
                    'top': '50%'
                })
                .html('&nbsp;');
            $(document.body).append(cursor);
        }

        function showMouseMove(pos, userId) {
            var top, left;
            if (pos.element) {
                var target = $(elementFinder.findElement(pos.element));
                var offset = target.offset();
                top = offset.top + pos.offsetY;
                left = offset.left + pos.offsetX;
            } else {
                // No anchor, just an absolute position
                top = pos.top;
                left = pos.left;
            }
            setCursorPosition(userId, top, left);
        }

        function setCursorPosition(userId, top, left) {
            cursorId = '#cursor' + userId;
            $(cursorId).css({
                'left': left,
                'top': top
            });
        }


        /************************
         * Mouse click handlers *
         ************************/

        $(document).on('click', function (event) {
            // Prevent click event from repeating between clients.
            if (event.internalClick) {
                return;
            }
            var element = event.target;
            if (element == document.documentElement) {
                // For some reason clicking on <body> gives the <html> element here
                element = document.body;
            }
            if (element.nodeName.toLowerCase() === 'video') {
                return;
            }
            var location = elementFinder.elementLocation(element);
            var offset = $(element).offset();
            var offsetX = event.pageX - offset.left;
            var offsetY = event.pageY - offset.top;

            socket.emit('mouseClick', {
                type: "mouse-click",
                element: location,
                offsetX: offsetX,
                offsetY: offsetY
            });
        });

        // Waiting for "mouse click" from other clients.
        socket.on('onMouseClick', function (data) {
            var target = $(elementFinder.findElement(data.mouseClickData.element));
            var offset = target.offset();
            var top = offset.top + data.mouseClickData.offsetY;
            var left = offset.left + data.mouseClickData.offsetX;

            $(target).trigger({
                type: "click",
                internalClick: true
            });
            showMouseClick(top, left);
        });

        function showMouseClick(top, left) {
            clicker = $(document.createElement('div'))
                .addClass('cursor-click')
                .css({
                    'background-color': 'rgba(0, 0, 0, 0.5)',
                    'top': top - 15,
                    'left': left - 15
                })
                .html('&nbsp;');
            $(document.body).append(clicker);
            clicker.fadeOut(1500, function () {
                $(this).remove();
            });
        }

        /************************
         * Mouse scroll handlers *
         ************************/

        $(window).on('scroll', scroll);

        var scrollTimeout = null;
        var scrollTimeoutSet = 0;
        var SCROLL_DELAY_TIMEOUT = 75;
        var SCROLL_DELAY_LIMIT = 300;

        function scroll() {
            var now = Date.now();
            if (scrollTimeout) {
                if (now - scrollTimeoutSet < SCROLL_DELAY_LIMIT) {
                    clearTimeout(scrollTimeout);
                } else {
                    // Just let it progress anyway
                    return;
                }
            }
            scrollTimeout = setTimeout(_scrollRefresh, SCROLL_DELAY_TIMEOUT);
            if (!scrollTimeoutSet) {
                scrollTimeoutSet = now;
            }
        }

        var lastScrollMessage = null;

        function _scrollRefresh() {
            scrollTimeout = null;
            scrollTimeoutSet = 0;
            //   Cursor.forEach(function (c) {
            //     c.refresh();
            //   });
            console.log(elementFinder.elementByPixel($(window).scrollTop()));
            lastScrollMessage = {
                type: "scroll-update",
                position: elementFinder.elementByPixel($(window).scrollTop())
            };

            socket.emit("mouseScroll", lastScrollMessage);
        }

        socket.on("onMouseScroll", function (data) {
            $(window).scrollTo($(data.mouseScrollData.absoluteTop), 500);
            // window.scrollTo(0, data.mouseScrollData.absoluteTop);
        });
    });
});
