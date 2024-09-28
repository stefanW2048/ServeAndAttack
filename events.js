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
                if (App.models.currentServeData) {
                    App.models.currentServeData.rating = -1;
                    App.draw.addServe(App.models.currentServeData);
                    App.ui.hideRatingMenu();
                }
            };

            document.getElementById('rating-neutral').onclick = () => {
                if (App.models.currentServeData) {
                    App.models.currentServeData.rating = 0;
                    App.draw.addServe(App.models.currentServeData);
                    App.ui.hideRatingMenu();
                }
            };

            document.getElementById('rating-positive').onclick = () => {
                if (App.models.currentServeData) {
                    App.models.currentServeData.rating = 1;
                    App.draw.addServe(App.models.currentServeData);
                    App.ui.hideRatingMenu();
                }
            };
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
                const players = App.models.teams[App.models.servingTeamIndex].players;
                players.forEach((player, index) => {
                    const btn = document.createElement('button');
                    const isActive = index === App.models.currentPlayerIndex;

                    // Set button text: volleyball emoji + number if active, else just number
                    if (isActive) {
                        btn.textContent = '🏐 ' + player.number; // Active player with emoji
                    } else {
                        btn.textContent = player.number; // Inactive player
                    }

                    btn.title = player.name; // Show player name as tooltip
                    btn.addEventListener('click', () => {
                        App.models.currentPlayerIndex = index;
                        App.events.updatePlayerButtons();
                        App.draw.drawServes();
                    });
                    btn.classList.toggle('active', isActive);
                    playerButtonsContainer.appendChild(btn);
                });
            }
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
