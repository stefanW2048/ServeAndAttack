// init.js

var App = App || {};

(function () {
    App.init = {
        initializeApp: function () {
            let team1Name = 'Team 1';
            let team2Name = 'Team 2';

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
            App.draw.drawCourt(); // Update the court to display the new team names
        },

        askTeamNames: function () {
            // Only prompt if both team names are still the defaults
            if (App.models.teams[0].teamName === 'Team 1' && App.models.teams[1].teamName === 'Team 2') {
                let team1Name = prompt('Enter the name of Team 1:');
                let team2Name = prompt('Enter the name of Team 2:');

                if (team1Name && team2Name && team1Name !== team2Name) {
                    App.models.teams[0].teamName = team1Name;
                    App.models.teams[1].teamName = team2Name;
                    App.ui.updateTeamButtons();
                    App.draw.drawCourt(); // Update the court to display the new team names
                    return true;
                } else {
                    alert('Both team names are required and must be different.');
                    return false;
                }
            } else {
                // At least one team name is already set; no need to prompt
                return true;
            }
        },
    };
})();
