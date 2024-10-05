// models.js

var App = App || {};

(function () {
    App.models = {
        teams: [],
        servingTeamIndex: 0,
        currentPlayerIndex: null,
        currentTeamIndex: null, // Added to track the current team
        courtFlipped: false,
        currentActionData: null, // To hold serve or receive data before rating
        currentActionType: null, // To distinguish between 'serve' and 'receive'

        DRAG_THRESHOLD: 0.01,
        FIELD_SIZE: 0.7,
        BORDER_SIZE: 0.5 * (1.0 - 0.7),
    };
})();
