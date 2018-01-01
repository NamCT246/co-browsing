define(["require", "jquery", "scrollTo", "socket", "elementFinder", "eventMaker", "sessionManager"], function (require, $, scrollTo, socket, elementFinder, eventMaker, session) {

    $(document).ready(function () {

        /************************************
         * Connect to the signalling server *
         ************************************/

        var currentRoom;


        socket.connection.on('message', function (msg) {
            console.log(msg);
        })
        
        socket.connection.on('leaveRoom', function (data) {
            console.log("User " + data.username + " has just left the room");
            removeCursor(data.id);
        })

        socket.connection.on('success', function (room) {
            console.log("Successfully joined " + room);
            currentRoom = room;
        })        

        /************************
         * Button handlers *
         ************************/

        // todo: remove old cursor after leaving and entering new room.
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

            if ((!target) || target == document.documentElement || target == document.body) {
                lastMessage = {
                    type: "mouse-move",
                    top: pageY,
                    left: pageX,
                    room: currentRoom
                };
                socket.connection.emit('mouseMove', lastMessage);
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
                offsetY: Math.floor(offsetY),
                room: currentRoom
            };
            socket.connection.emit('mouseMove', lastMessage);
        }

        // Remote "mouse move" event.
        socket.connection.on('onMouseMove', function (data) {

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

            socket.connection.emit('mouseClick', {
                type: "mouse-click",
                element: location,
                offsetX: offsetX,
                offsetY: offsetY,
                room: currentRoom
            });
        });

        // Waiting for "mouse click" from other clients.
        socket.connection.on('onMouseClick', function (data) {
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
            console.log(elementFinder.elementByPixel($(window).scrollTop()));
            lastScrollMessage = {
                type: "scroll-update",
                position: elementFinder.elementByPixel($(window).scrollTop()),
                room: currentRoom
            };

            socket.connection.emit("mouseScroll", lastScrollMessage);
        }

        socket.connection.on("onMouseScroll", function (data) {
            console.log(data.mouseScrollData.position.absoluteTop);
            $(window).scrollTop( data.mouseScrollData.position.absoluteTop );
        });

        /************************
         * Input handlers *
         ************************/
        
        $(document).on('input', function(event){     
            var el = event.target,
                elValue = $(el).val();       
            
            var location = elementFinder.elementLocation(el);
            console.log(currentRoom);
            socket.connection.emit('inputChanged', {
                'location': location,
                'value': elValue,
                'room': currentRoom
            })
        })

        socket.connection.on('onInputChanged', function(data){
            console.log(data, data.inputData.location);
            var el = elementFinder.findElement(data.inputData.location);
            $(el).val(data.inputData.value);
        })
    });
});
