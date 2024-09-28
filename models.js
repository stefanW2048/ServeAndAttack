// models.js

var App = App || {};

(function () {
    App.models = {
        teams: [],
        servingTeamIndex: 0,
        currentPlayerIndex: null,
        courtFlipped: false,
        currentServeData: null, // To hold serve data before rating

        DRAG_THRESHOLD: 0.01,
        FIELD_SIZE: 0.7,
        BORDER_SIZE: 0.5 * (1.0 - 0.7),
    };
})();
