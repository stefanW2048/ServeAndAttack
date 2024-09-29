// init.js

var App = App || {};

(function () {
    App.init = {
        initializeApp: function () {
            let team1Name = 'Lenting';
            let team2Name = 'TV Ingolstadt';

            const debug = true;
            if (!debug) {
                team1Name = prompt('Enter the name of Team 1:');
                team2Name = prompt('Enter the name of Team 2:');
            }

            if (team1Name && team2Name && !(team1Name==team2Name)) {
                App.models.teams = [
                    {
                        teamName: team1Name,
                        players: [],
                    },
                    {
                        teamName: team2Name,
                        players: [],
                    },
                ];
                App.models.servingTeamIndex = 0;
                App.models.currentPlayerIndex = null;
                App.ui.addTeamButtons();
                App.ui.updateTeamButtons();
                App.draw.drawCourt(); // Update the court to display the new team names
            } else {
                alert('Both team names are required.');
                App.init.initializeApp(); // Restart initialization if names are not provided
            }
        },
    };
})();
