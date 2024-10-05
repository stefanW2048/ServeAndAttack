// utils.js

var App = App || {};

(function () {
    App.utils = {
        getEventPos: function (e) {
            const rect = App.canvas.getBoundingClientRect();
            let clientX, clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) / App.canvas.width,
                y: (clientY - rect.top) / App.canvas.height,
            };
        },

        isValidLine: function (sx, ex) {
            if (App.utils.isReceivingTeamLeft()) {
                return sx > 0.5;
            } else {
                return sx < 0.5 ;
            }
        },

        isAttack: function (xStart) {
            if (App.utils.isReceivingTeamLeft()) {
                return xStart < 0.75;
            } else {
                return xStart > 0.25;
            }
        },

        isReceivingTeamLeft: function () {
            return App.models.courtFlipped === (App.models.servingTeamIndex === 0);
        },

        deltaX: function (a, b) {
            return Math.abs(a.x - b.x);
        },

        isDrag: function (a, b) {
            return App.utils.deltaX(a, b) > App.models.DRAG_THRESHOLD;
        },
    };
})();
