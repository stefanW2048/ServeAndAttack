// ui.js

var App = App || {};

(function () {
    App.ui = {
        showAddPlayerModal: function () {
            // Ask for team names if not set
            if (!App.init.askTeamNames()) {
                return;
            }
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

                if (number) {
                    App.ui.addPlayer(number, name);
                    modal.style.display = 'none';
                    document.getElementById('add-player-form').reset();
                } else {
                    alert('Please enter a player number.');
                }
            };
        },

        addPlayer: function (number, name) {
            const team = App.models.teams[App.models.servingTeamIndex];
            // Check if player with same number exists
            const existingPlayer = team.players.find(
                (player) => player.number === number
            );
            if (existingPlayer) {
                alert('Player with same number already exists in this team.');
            } else {
                const newPlayer = {
                    number: number,
                    name: name,
                    serves: [],
                    receives: [], // Initialize receives array
                };
                team.players.push(newPlayer);
                App.models.currentPlayerIndex = team.players.length - 1;
                App.models.currentTeamIndex = App.models.servingTeamIndex; // Set current team
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

            // Team selection
            const teamSelect = document.getElementById('edit-team-select');
            teamSelect.innerHTML = '';
            App.models.teams.forEach((team, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = team.teamName;
                teamSelect.appendChild(option);
            });

            // Generate player list for editing
            const playersDiv = document.getElementById('edit-team-players');

            const updatePlayerList = function () {
                playersDiv.innerHTML = ''; // Clear existing content

                const teamIndex = parseInt(teamSelect.value);
                const team = App.models.teams[teamIndex];

                // Create table structure
                const table = document.createElement('table');
                table.className = 'player-table';

                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                const numberHeader = document.createElement('th');
                numberHeader.textContent = 'Nr';
                headerRow.appendChild(numberHeader);

                const nameHeader = document.createElement('th');
                nameHeader.textContent = 'Name';
                headerRow.appendChild(nameHeader);

                const serveStatsHeader = document.createElement('th');
                serveStatsHeader.textContent = 'Serves (−/0/+)';
                headerRow.appendChild(serveStatsHeader);

                const receiveStatsHeader = document.createElement('th');
                receiveStatsHeader.textContent = 'Receives (−/0/+)';
                headerRow.appendChild(receiveStatsHeader);

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Create table body
                const tbody = document.createElement('tbody');

                team.players.forEach((player, index) => {
                    const row = document.createElement('tr');
                    row.className = 'edit-player-row';

                    // Number input
                    const numberCell = document.createElement('td');
                    const numberInput = document.createElement('input');
                    numberInput.type = 'text';
                    numberInput.value = player.number;
                    numberInput.maxLength = 3;
                    numberInput.style.width = '50px';
                    numberInput.style.textAlign = 'center';
                    numberCell.appendChild(numberInput);
                    row.appendChild(numberCell);

                    // Name input
                    const nameCell = document.createElement('td');
                    const nameInput = document.createElement('input');
                    nameInput.type = 'text';
                    nameInput.value = player.name || '';
                    nameInput.style.width = '100%';
                    nameCell.appendChild(nameInput);
                    row.appendChild(nameCell);

                    // Serve stats
                    const serveStatsCell = document.createElement('td');
                    const negativeServeCount = player.serves.filter(s => s.rating === -1).length;
                    const neutralServeCount = player.serves.filter(s => s.rating === 0).length;
                    const positiveServeCount = player.serves.filter(s => s.rating === 1).length;
                    serveStatsCell.textContent = `${negativeServeCount}/${neutralServeCount}/${positiveServeCount}`;
                    serveStatsCell.style.textAlign = 'center';
                    row.appendChild(serveStatsCell);

                    // Receive stats
                    const receiveStatsCell = document.createElement('td');
                    const negativeReceiveCount = player.receives.filter(s => s.rating === -1).length;
                    const neutralReceiveCount = player.receives.filter(s => s.rating === 0).length;
                    const positiveReceiveCount = player.receives.filter(s => s.rating === 1).length;
                    receiveStatsCell.textContent = `${negativeReceiveCount}/${neutralReceiveCount}/${positiveReceiveCount}`;
                    receiveStatsCell.style.textAlign = 'center';
                    row.appendChild(receiveStatsCell);

                    tbody.appendChild(row);

                    // Save changes when inputs lose focus
                    numberInput.onblur = function () {
                        const newNumber = numberInput.value.trim();
                        if (newNumber) {
                            // Check for duplicate numbers
                            const duplicate = team.players.find(
                                (p, idx) => idx !== index && p.number === newNumber
                            );
                            if (duplicate) {
                                alert('A player with this number already exists.');
                                numberInput.value = player.number;
                            } else {
                                player.number = newNumber;
                                App.events.updatePlayerButtons();
                            }
                        } else {
                            alert('Number cannot be empty.');
                            numberInput.value = player.number;
                        }
                    };

                    nameInput.onblur = function () {
                        const newName = nameInput.value.trim();
                        // Name is optional; update directly
                        player.name = newName;
                        App.events.updatePlayerButtons();
                    };
                });

                table.appendChild(tbody);
                playersDiv.appendChild(table);
            };

            // Update player list when team selection changes
            teamSelect.onchange = updatePlayerList;

            // Initial call to populate the player list
            updatePlayerList();
        },

        showRatingMenu: function (actionData, actionType) {
            App.models.currentActionData = actionData;
            App.models.currentActionType = actionType || 'serve';

            // Update the modal title
            const modal = document.getElementById('rating-modal');
            const modalTitle = modal.querySelector('h2');
            if (App.models.currentActionType === 'serve') {
                modalTitle.textContent = 'Rate the Serve';
            } else if (App.models.currentActionType === 'receive') {
                modalTitle.textContent = 'Rate the Receive';
            }

            // Show the modal
            modal.style.display = 'block';
        },

        hideRatingMenu: function () {
            const modal = document.getElementById('rating-modal');
            modal.style.display = 'none';
            App.models.currentActionData = null;
            App.models.currentActionType = null;
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

        saveData: function () {
            const data = {
                teams: App.models.teams,
                courtFlipped: App.models.courtFlipped,
            };

            // Serialize data to JSON string
            const jsonData = JSON.stringify(data);

            // Create a Blob from the JSON string
            const blob = new Blob([jsonData], { type: 'application/json' });

            // Generate filename
            const timestamp = new Date();
            const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
            const timeStr = timestamp.toTimeString().slice(0, 5).replace(/:/g, '');
            const teamNames = App.models.teams.map(team => team.teamName.replace(/\s+/g, '_')).join('_');
            const filename = `${dateStr}_${timeStr}_${teamNames}.swi`;

            // Create a link to download the Blob
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;

            // Append link to body and trigger click
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
        },

        loadData: function () {
            // Create an input element to select files
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.swi,application/json';

            input.onchange = function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        try {
                            const data = JSON.parse(event.target.result);

                            // Show team selection modal
                            App.ui.showTeamSelectionModal(data);
                        } catch (err) {
                            alert('Invalid file format.');
                        }
                    };
                    reader.readAsText(file);
                }
            };

            // Trigger the file input click
            input.click();
        },

        showTeamSelectionModal: function (data) {
            // Create a modal to select which team data to import
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            const closeBtn = document.createElement('span');
            closeBtn.className = 'close';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function () {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            const title = document.createElement('h2');
            title.textContent = 'Select Team to Import';

            const form = document.createElement('form');

            // Radio buttons for team selection
            data.teams.forEach((team, index) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'teamSelect';
                radio.value = index;
                if (index === 0) radio.checked = true; // Default to first team
                label.appendChild(radio);
                label.appendChild(document.createTextNode(team.teamName));
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
            });

            // Input for the second team name if only one team is imported
            const secondTeamDiv = document.createElement('div');
            secondTeamDiv.style.marginTop = '10px';
            const secondTeamLabel = document.createElement('label');
            secondTeamLabel.textContent = 'Enter the name of the second team: ';
            const secondTeamInput = document.createElement('input');
            secondTeamInput.type = 'text';
            secondTeamInput.placeholder = 'Team 2 Name';
            secondTeamLabel.appendChild(secondTeamInput);
            secondTeamDiv.appendChild(secondTeamLabel);

            form.appendChild(secondTeamDiv);

            const importBtn = document.createElement('button');
            importBtn.type = 'button';
            importBtn.textContent = 'Import';
            importBtn.onclick = function () {
                const selectedTeamIndex = parseInt(form.teamSelect.value, 10);
                const selectedTeam = data.teams[selectedTeamIndex];
                const otherTeamName = secondTeamInput.value.trim();

                if (selectedTeam) {
                    if (!otherTeamName) {
                        alert('Please enter the name of the second team.');
                        return;
                    }
                    // Initialize teams
                    App.models.teams = [
                        selectedTeamIndex === 0 ? selectedTeam : { teamName: otherTeamName, players: [] },
                        selectedTeamIndex === 1 ? selectedTeam : { teamName: otherTeamName, players: [] },
                    ];

                    // Set serving team index
                    App.models.servingTeamIndex = 0;
                    App.models.currentPlayerIndex = null;
                    App.models.courtFlipped = data.courtFlipped || false;

                    App.ui.addTeamButtons();
                    App.ui.updateTeamButtons();
                    App.events.updatePlayerButtons();
                    App.draw.drawServes();

                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                } else {
                    alert('Please select a team to import.');
                }
            };

            modalContent.appendChild(closeBtn);
            modalContent.appendChild(title);
            modalContent.appendChild(form);
            modalContent.appendChild(importBtn);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        },


    };
})();
