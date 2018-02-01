// currently these events are taken from togetherjs
define([
    'jquery',
    'scrollTo',
    'socket',
    'elementFinder',
    'eventMaker',
    'main-ui',
], function ($, scrollTo, socket, elementFinder, eventMaker, ui) {

    var cursor = {
        init: function (room) {
            this.clientId = socket.getClientId();
            this.currentRoom = room;
        }
    };

    function createCursor(id) {
        createdUsers.push(id);

        var cursorId = 'cursor' + id;
        var cursor = $(document.createElement('div'))
            .attr('id', cursorId)
            .addClass('cursor')
            .css({
                'background-color': ui.getUserColor(id),
                left: '50%',
                top: '50%'
            })
            .html('&nbsp;');

        $(document.body).append(cursor);
    }

    function removeCursor(id) {
        var cursorId = '#cursor' + id;
        $(cursorId).remove();
    }

    socket.connection.on('leaveRoom', (data) => {
        removeCursor(data.id);
    });

    /** *********************
     * Mouse move handlers *
     ********************** */

    // Local "mouse move" event.
    $(document).mousemove(mousemove);

    let lastTime = 0,
        lastPosX = -1,
        lastPosY = -1,
        lastMessage = null,
        createdUsers = [];

    function mousemove(event) {
        const now = Date.now();
        lastTime = now;
        let pageX = event.pageX,
            pageY = event.pageY;

        if (Math.abs(lastPosX - pageX) < 3 && Math.abs(lastPosY - pageY) < 3) {
            // Not a substantial enough change
            return;
        }
        lastPosX = pageX;
        lastPosY = pageY;
        let target = event.target;

        if (
            !target ||
            target == document.documentElement ||
            target == document.body
        ) {
            lastMessage = {
                type: 'mouse-move',
                top: pageY,
                left: pageX,
                room: cursor.currentRoom
            };
            console.log(lastMessage);
            socket.connection.emit('mouseMove', lastMessage);
            return;
        }

        target = $(target);
        const offset = target.offset();

        if (!offset) {
            console.warn('Could not get offset of element:', target[0]);
            return;
        }

        const offsetX = pageX - offset.left;
        const offsetY = pageY - offset.top;

        lastMessage = {
            type: 'mouse-move',
            element: elementFinder.elementLocation(target),
            offsetX: Math.floor(offsetX),
            offsetY: Math.floor(offsetY),
            room: cursor.currentRoom
        };
        socket.connection.emit('mouseMove', lastMessage);
    }

    socket.connection.on('onMouseMove', (data) => {
        if ($.inArray(data.id, createdUsers) === -1) {
            createCursor(data.id);
        }

        showMouseMove(data.mouseMoveData, data.id);
    });

    function showMouseMove(pos, userId) {
        let top,
            left;

        if (pos.element) {
            const target = $(elementFinder.findElement(pos.element));
            const offset = target.offset();
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
        var cursorId = '#cursor' + userId;
        $(cursorId).css({
            left: left,
            top: top,
        });
    }

    /** **********************
     * Mouse click handlers *
     *********************** */

    $(document).on('click', (event) => {
        // Prevent click event from repeating between clients.
        if (event.internalClick) {
            return;
        }
        let element = event.target;
        if (element == document.documentElement) {
            // For some reason clicking on <body> gives the <html> element here
            element = document.body;
        }
        if (element.nodeName.toLowerCase() === 'video') {
            return;
        }
        const location = elementFinder.elementLocation(element);
        const offset = $(element).offset();
        const offsetX = event.pageX - offset.left;
        const offsetY = event.pageY - offset.top;

        socket.connection.emit('mouseClick', {
            type: 'mouse-click',
            element: location,
            offsetX,
            offsetY,
            room: cursor.currentRoom,
        });
    });

    socket.connection.on('onMouseClick', (data) => {
        const target = $(elementFinder.findElement(data.mouseClickData.element));
        const offset = target.offset();
        const top = offset.top + data.mouseClickData.offsetY;
        const left = offset.left + data.mouseClickData.offsetX;

        // eventMaker.performClick(target);
        // Last time this doesnt trigger when chaing URl
        $(target).trigger({
            type: 'click',
            internalClick: true,
        });
        showMouseClick(top, left);
    });

    function showMouseClick(top, left) {
        clicker = $(document.createElement('div'))
            .addClass('cursor-click')
            .css({
                'background-color': 'rgba(0, 0, 0, 0.5)',
                top: top - 15,
                left: left - 15
            })
            .html('&nbsp;');
        $(document.body).append(clicker);
        clicker.fadeOut(1500, function () {
            $(this).remove();
        });
    }

    /** **********************
     * Mouse scroll handlers *
     *********************** */

    $(window).on('scroll', scroll);

    let scrollTimeout = null;
    let scrollTimeoutSet = 0;
    const SCROLL_DELAY_TIMEOUT = 75;
    const SCROLL_DELAY_LIMIT = 300;

    function scroll() {
        const now = Date.now();
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

    let lastScrollMessage = null;

    function _scrollRefresh() {
        scrollTimeout = null;
        scrollTimeoutSet = 0;
        console.log(elementFinder.elementByPixel($(window).scrollTop()));
        lastScrollMessage = {
            type: 'scroll-update',
            position: elementFinder.elementByPixel($(window).scrollTop()),
            room: cursor.currentRoom
        };

        socket.connection.emit('mouseScroll', lastScrollMessage);
    }

    socket.connection.on('onMouseScroll', (data) => {
        console.log(data.mouseScrollData.position.absoluteTop);
        $(window).scrollTop(data.mouseScrollData.position.absoluteTop);
    });

    /** **********************
     * Input handlers *
     *********************** */

    $(document).on('input', (event) => {
        let el = event.target,
            elValue = $(el).val();

        const location = elementFinder.elementLocation(el);
        socket.connection.emit('inputChanged', {
            location,
            value: elValue,
            room: cursor.currentRoom,
        });
    });

    socket.connection.on('onInputChanged', data => {
        const el = elementFinder.findElement(data.inputData.location);
        $(el).val(data.inputData.value);
    });


    return cursor;
});