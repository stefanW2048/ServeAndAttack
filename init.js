// init.js

var App = App || {};

(function () {
    App.init = {
        initializeApp: function () {
            // Check if data exists in localStorage
            const jsonData = localStorage.getItem('volleyballTrackerData');
            if (jsonData) {
                try {
                    const data = JSON.parse(jsonData);
                    // Load data into the application
                    App.models.teams = data.teams;
                    App.models.courtFlipped = data.courtFlipped || false;
                    App.models.servingTeamIndex = 0;
                    App.models.currentPlayerIndex = null;
                    App.models.currentTeamIndex = null;

                    App.events.updatePlayerButtons();
                    App.draw.drawServes();
                } catch (err) {
                    console.error('Failed to parse saved data:', err);
                    this.initializeDefaultData();
                }
            } else {
                // No saved data, initialize with default data
                this.initializeDefaultData();
            }
        },

        initializeDefaultData: function () {
            App.models.teams = [
                { teamName: 'Team 1', players: [] },
                { teamName: 'Team 2', players: [] },
            ];
            App.models.servingTeamIndex = 0;
            App.models.currentPlayerIndex = null;
            App.models.currentTeamIndex = null;
            App.models.courtFlipped = false;

            App.events.updatePlayerButtons();
            App.draw.drawCourt();
        },

        askTeamNames: function () {
            // Only prompt if both team names are still the defaults
            if (App.models.teams[0].teamName === 'Team 1' && App.models.teams[1].teamName === 'Team 2') {
                let team1Name = prompt('Enter the name of Team 1:');
                let team2Name = prompt('Enter the name of Team 2:');

                if (team1Name && team2Name && team1Name !== team2Name) {
                    App.models.teams[0].teamName = team1Name;
                    App.models.teams[1].teamName = team2Name;
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
