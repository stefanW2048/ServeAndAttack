// ui.js

var App = App || {};

(function () {
    App.ui = {
        showAddPlayerModal: function () {
            // Show the modal
            const modal = document.getElementById('add-player-modal');
            modal.style.display = 'block';

            // Set the modal title to include the team name
            const teamName = App.models.teams[App.models.servingTeamIndex].teamName;
            const modalTitle = modal.querySelector('h2');
            modalTitle.textContent = `Add Player (${teamName})`;

            // Close button
            document.getElementById('add-player-close').onclick = function () {
                modal.style.display = 'none';
            };

            // Cancel button
            document.getElementById('add-player-cancel').onclick = function () {
                modal.style.display = 'none';
            };

            // Submit form
            document.getElementById('add-player-form').onsubmit = function (e) {
                e.preventDefault();
                const number = document.getElementById('player-number').value.trim();
                const name = document.getElementById('player-name').value.trim();

                if (number && name) {
                    App.ui.addPlayer(number, name);
                    modal.style.display = 'none';
                    document.getElementById('add-player-form').reset();
                } else {
                    alert('Please enter both number and name.');
                }
            };
        },

        addPlayer: function (number, name) {
            const team = App.models.teams[App.models.servingTeamIndex];
            // Check if player with same number or name exists
            const existingPlayer = team.players.find(
                (player) => player.number === number || player.name === name
            );
            if (existingPlayer) {
                alert('Player with same number or name already exists in this team.');
            } else {
                const newPlayer = {
                    number: number,
                    name: name,
                    serves: [],
                };
                team.players.push(newPlayer);
                App.models.currentPlayerIndex = team.players.length - 1;
                App.events.updatePlayerButtons();
                App.draw.drawServes();
            }
        },

        showEditTeamModal: function () {
            // Show the modal
            const modal = document.getElementById('edit-team-modal');
            modal.style.display = 'block';

            // Close button
            document.getElementById('edit-team-close').onclick = function () {
                modal.style.display = 'none';
            };

            // Done button
            document.getElementById('edit-team-done').onclick = function () {
                modal.style.display = 'none';
                App.events.updatePlayerButtons();
            };

            // Generate player list for editing
            const playersDiv = document.getElementById('edit-team-players');
            playersDiv.innerHTML = ''; // Clear existing content

            const team = App.models.teams[App.models.servingTeamIndex];
            team.players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'edit-player';

                const numberInput = document.createElement('input');
                numberInput.type = 'text';
                numberInput.value = player.number;
                numberInput.maxLength = 3;
                numberInput.style.width = '50px';

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = player.name;

                // Calculate serve ratings counts
                const negativeCount = player.serves.filter(s => s.rating === -1).length;
                const neutralCount = player.serves.filter(s => s.rating === 0).length;
                const positiveCount = player.serves.filter(s => s.rating === 1).length;

                const statsLabel = document.createElement('span');
                statsLabel.textContent = ` 🏐${negativeCount}/${neutralCount}/${positiveCount}`;

                playerDiv.appendChild(document.createTextNode('Nr: '));
                playerDiv.appendChild(numberInput);
                playerDiv.appendChild(document.createTextNode('Name: '));
                playerDiv.appendChild(nameInput);
                playerDiv.appendChild(statsLabel);

                playersDiv.appendChild(playerDiv);

                // Save changes when inputs lose focus
                numberInput.onblur = function () {
                    const newNumber = numberInput.value.trim();
                    if (newNumber) {
                        player.number = newNumber;
                    } else {
                        alert('Number cannot be empty.');
                        numberInput.value = player.number;
                    }
                };

                nameInput.onblur = function () {
                    const newName = nameInput.value.trim();
                    if (newName) {
                        player.name = newName;
                    } else {
                        alert('Name cannot be empty.');
                        nameInput.value = player.name;
                    }
                };
            });
        },

        showRatingMenu: function (serveData) {
            App.models.currentServeData = serveData;

            // Show the modal
            const modal = document.getElementById('rating-modal');
            modal.style.display = 'block';
        },

        hideRatingMenu: function () {
            const modal = document.getElementById('rating-modal');
            modal.style.display = 'none';
            App.models.currentServeData = null;
        },

        addTeamButtons: function () {
            const teamButtonsContainer = document.getElementById('team-buttons');
            teamButtonsContainer.innerHTML = ''; // Clear existing buttons

            App.models.teams.forEach((team, index) => {
                const btn = document.createElement('button');
                btn.textContent = team.teamName;
                btn.addEventListener('click', () => {
                    App.models.servingTeamIndex = index;
                    App.models.currentPlayerIndex = null; // Reset current player
                    App.ui.updateTeamButtons();
                    App.events.updatePlayerButtons();
                    App.draw.drawServes();
                });
                teamButtonsContainer.appendChild(btn);
            });
        },

        updateTeamButtons: function () {
            const buttons = document.getElementById('team-buttons').children;
            for (let i = 0; i < buttons.length; i++) {
                const isActive = i === App.models.servingTeamIndex;
                buttons[i].classList.toggle('active', isActive);
                const teamName = App.models.teams[i].teamName;
                if (isActive) {
                    buttons[i].textContent = '🏐 ' + teamName; // Add volleyball emoji
                } else {
                    buttons[i].textContent = teamName; // No emoji for inactive teams
                }
            }
        },
    };
})();
