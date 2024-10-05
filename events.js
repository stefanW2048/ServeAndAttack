// events.js

var App = App || {};

(function () {
    App.events = {
        initializeEventHandlers: function () {
            const canvas = App.canvas;

            // Unified event listeners for both mouse and touch events
            canvas.addEventListener('mousedown', App.events.handleStart);
            canvas.addEventListener('mousemove', App.events.handleMove);
            canvas.addEventListener('mouseup', App.events.handleEnd);

            canvas.addEventListener('touchstart', App.events.handleStart, { passive: false });
            canvas.addEventListener('touchmove', App.events.handleMove, { passive: false });
            canvas.addEventListener('touchend', App.events.handleEnd);

            // Set up rating buttons event handlers
            document.getElementById('rating-negative').onclick = () => {
                App.events.handleRating(-1);
            };

            document.getElementById('rating-neutral').onclick = () => {
                App.events.handleRating(0);
            };

            document.getElementById('rating-positive').onclick = () => {
                App.events.handleRating(1);
            };

            document.getElementById('rating-close').onclick = () => {
                App.ui.hideRatingMenu();
            };
        },

        handleRating: function (rating) {
            if (App.models.currentActionData) {
                App.models.currentActionData.rating = rating;
                if (App.models.currentActionType === 'serve') {
                    App.draw.addServe(App.models.currentActionData);
                } else if (App.models.currentActionType === 'receive') {
                    App.events.addReceive(App.models.currentActionData);
                }
                App.ui.hideRatingMenu();
            }
        },

        addReceive: function (receiveData) {
            const player = App.models.teams[App.models.currentTeamIndex].players[App.models.currentPlayerIndex];
            player.receives.push(receiveData);
        },

        handleStart: function (e) {
            e.preventDefault();
            if (App.models.currentPlayerIndex === null) {
                App.ui.showAddPlayerModal();
                return;
            }
            const currentPosition = App.utils.getEventPos(e);

            if (App.events.clickStartPoint !== null) {
                App.events.drawLine(App.events.clickStartPoint, currentPosition);
                App.events.clickStartPoint = null;
                App.events.mouseDownPoint = null;
            } else {
                App.events.mouseDownPoint = currentPosition;
            }
        },

        handleMove: function (e) {
            e.preventDefault();
            const currentPosition = App.utils.getEventPos(e);

            if (App.events.clickStartPoint != null) {
                App.draw.drawServes();

                // Create a temporary serve object
                const tempServe = {
                    startX: App.events.clickStartPoint.x,
                    startY: App.events.clickStartPoint.y,
                    endX: currentPosition.x,
                    endY: currentPosition.y,
                    rating: null, // No rating yet
                };

                App.draw.drawServeOrAttack(tempServe, 1.0);
                return;
            }

            if (App.events.mouseDownPoint != null) {
                App.draw.drawServes();

                // Create a temporary serve object
                const tempServe = {
                    startX: App.events.mouseDownPoint.x,
                    startY: App.events.mouseDownPoint.y,
                    endX: currentPosition.x,
                    endY: currentPosition.y,
                    rating: null, // No rating yet
                };

                App.draw.drawServeOrAttack(tempServe, 1.0);
                return;
            }
        },


        handleEnd: function (e) {
            e.preventDefault();
            const currentPosition = App.utils.getEventPos(e);

            if (App.events.mouseDownPoint !== null) {
                if (App.utils.isDrag(App.events.mouseDownPoint, currentPosition)) {
                    App.events.drawLine(App.events.mouseDownPoint, currentPosition);
                    App.events.mouseDownPoint = null;
                } else {
                    App.events.clickStartPoint = App.events.mouseDownPoint;
                }
            }
        },

        drawLine: function (start, end) {
            if (App.utils.isValidLine(start.x, end.x)) {
                const serveData = {
                    startX: start.x,
                    startY: start.y,
                    endX: end.x,
                    endY: end.y,
                    timestamp: new Date(),
                };
                App.ui.showRatingMenu(serveData); // Show rating menu
            }
            App.draw.drawServes();
        },

        updatePlayerButtons: function () {
            const playerButtonsContainer = document.getElementById('player-buttons');
            playerButtonsContainer.innerHTML = ''; // Clear existing buttons

            if (App.models.servingTeamIndex !== null) {
                const servingTeamIndex = App.models.servingTeamIndex;
                const receivingTeamIndex = 1 - App.models.servingTeamIndex;

                // Serving Team Section
                const servingTeam = App.models.teams[servingTeamIndex];

                // Serving Team Button
                const servingTeamButton = document.createElement('button');
                servingTeamButton.textContent = '🏐 ' + servingTeam.teamName;
                servingTeamButton.classList.add('team-button');
				servingTeamButton.addEventListener('click', () => {
                    App.models.servingTeamIndex = (App.models.servingTeamIndex+1)%2;
                    App.models.currentPlayerIndex = null; 
                    App.events.updatePlayerButtons();
                    App.draw.drawServes();
                });
                playerButtonsContainer.appendChild(servingTeamButton);

                // Serving Team Players
                servingTeam.players.forEach((player, index) => {
                    const btn = document.createElement('button');
                    const isActive = index === App.models.currentPlayerIndex && App.models.currentTeamIndex === servingTeamIndex;

                    // Set button text
                    if (isActive) {
                        btn.textContent = '🏐 ' + player.number;
                    } else {
                        btn.textContent = player.number;
                    }

                    btn.title = player.name; // Tooltip
                    btn.addEventListener('click', () => {
                        App.models.currentPlayerIndex = index;
                        App.models.currentTeamIndex = servingTeamIndex;
                        App.events.updatePlayerButtons();
                        App.draw.drawServes();
                    });
                    btn.classList.toggle('active', isActive);
                    playerButtonsContainer.appendChild(btn);
                });

                // Separator
                const separator = document.createElement('div');
                separator.classList.add('separator');
                playerButtonsContainer.appendChild(separator);

                // Receiving Team Section
                const receivingTeam = App.models.teams[receivingTeamIndex];

                // Receiving Team Button
                const receivingTeamButton = document.createElement('button');
                receivingTeamButton.textContent = '🎾 ' + receivingTeam.teamName;
                receivingTeamButton.classList.add('team-button');
				 receivingTeamButton.addEventListener('click', () => {
                    App.models.servingTeamIndex = (App.models.servingTeamIndex+1)%2;
                    App.models.currentPlayerIndex = null; 
                    App.events.updatePlayerButtons();
                    App.draw.drawServes();
                });
                playerButtonsContainer.appendChild(receivingTeamButton);

                // Receiving Team Players
                receivingTeam.players.forEach((player, index) => {
                    const btn = document.createElement('button');
                    const isActive = index === App.models.currentPlayerIndex && App.models.currentTeamIndex === receivingTeamIndex;

                    // Set button text
                    if (isActive) {
                        btn.textContent = '🎾 ' + player.number;
                    } else {
                        btn.textContent = player.number;
                    }

                    btn.title = player.name; // Tooltip
                    btn.addEventListener('click', () => {
                        App.models.currentPlayerIndex = index;
                        App.models.currentTeamIndex = receivingTeamIndex;
                        App.events.updatePlayerButtons();
                        App.events.createReceiveAction();
                    });
                    btn.classList.toggle('active', isActive);
                    playerButtonsContainer.appendChild(btn);
                });
            }
        },

        createReceiveAction: function () {
            // Create receiveData object
            const receiveData = {
                timestamp: new Date(),
            };
            // Show rating menu for receive
            App.ui.showRatingMenu(receiveData, 'receive');
        },

        undoLastServe: function () {
            if (App.models.currentPlayerIndex !== null) {
                const player = App.models.teams[App.models.servingTeamIndex].players[App.models.currentPlayerIndex];
                if (player.serves.length > 0) {
                    player.serves.pop();
                    App.draw.drawServes();
                }
            }
        },

        mouseDownPoint: null,
        clickStartPoint: null,
    };
})();
