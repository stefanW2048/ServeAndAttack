// draw.js

var App = App || {};

(function () {
    App.canvas = document.getElementById('court');
    App.ctx = App.canvas.getContext('2d');

    App.draw = {
        drawCourt: function () {
            const ctx = App.ctx;
            const canvas = App.canvas;
            const models = App.models;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw court background
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw net
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            // Draw field rectangle that is smaller than the court rectangle
            const insetX = canvas.width * models.BORDER_SIZE;
            const insetY = canvas.height * models.BORDER_SIZE;
            const innerWidth = canvas.width * models.FIELD_SIZE;
            const innerHeight = canvas.height * models.FIELD_SIZE;

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(insetX, insetY, innerWidth, innerHeight);

            // Draw labels
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';

            const receivingTeamLeft = App.utils.isReceivingTeamLeft();

            // Define field boundaries
            const fieldLeft = insetX;
            const fieldRight = insetX + innerWidth;
            const fieldTop = insetY;
            const fieldBottom = insetY + innerHeight;

            // Define own field boundaries
            let ownFieldLeftX, ownFieldRightX;
            if (receivingTeamLeft) {
                ownFieldLeftX = fieldLeft;
                ownFieldRightX = fieldLeft + innerWidth / 2;
            } else {
                ownFieldLeftX = fieldLeft + innerWidth / 2;
                ownFieldRightX = fieldRight;
            }

            // Positions for labels at 1/3 and 2/3 horizontally in own field
            const oneThirdX = ownFieldLeftX + (ownFieldRightX - ownFieldLeftX) * (1 / 3);
            const twoThirdX = ownFieldLeftX + (ownFieldRightX - ownFieldLeftX) * (2 / 3);

            // Positions Y at 1/6, 1/2, and 5/6 of the field rectangle
            const positionsY = [
                fieldTop + (fieldBottom - fieldTop) * (1 / 6),
                fieldTop + (fieldBottom - fieldTop) * (1 / 2),
                fieldTop + (fieldBottom - fieldTop) * (5 / 6),
            ];

            // Draw team name label
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            const textWidthA = ctx.measureText(App.models.teams[0].teamName).width;
            const textWidthB = ctx.measureText(App.models.teams[1].teamName).width;
            const padding = 10;

            if (App.models.courtFlipped) {
                ctx.fillText(App.models.teams[1].teamName, padding, 20);
                ctx.fillText(App.models.teams[0].teamName, canvas.width - textWidthA - padding, 20);
            } else {
                ctx.fillText(App.models.teams[0].teamName, padding, 20);
                ctx.fillText(App.models.teams[1].teamName, canvas.width - textWidthB - padding, 20);
            }

            // Own side positions
            let positions;
            if (receivingTeamLeft) {
                positions = [
                    { num: '5', x: oneThirdX, y: positionsY[0] },
                    { num: '4', x: twoThirdX, y: positionsY[0] },
                    { num: '6', x: oneThirdX, y: positionsY[1] },
                    { num: '3', x: twoThirdX, y: positionsY[1] },
                    { num: '1', x: oneThirdX, y: positionsY[2] },
                    { num: '2', x: twoThirdX, y: positionsY[2] },
                ];
            } else {
                positions = [
                    { num: '2', x: oneThirdX, y: positionsY[0] },
                    { num: '1', x: twoThirdX, y: positionsY[0] },
                    { num: '3', x: oneThirdX, y: positionsY[1] },
                    { num: '6', x: twoThirdX, y: positionsY[1] },
                    { num: '4', x: oneThirdX, y: positionsY[2] },
                    { num: '5', x: twoThirdX, y: positionsY[2] },
                ];
            }
            positions.forEach((pos) => {
                ctx.fillText(pos.num, pos.x - 8, pos.y);
            });
        },

        drawServes: function () {
            App.draw.drawCourt();
            if (App.models.currentPlayerIndex !== null) {
                const player = App.models.teams[App.models.servingTeamIndex].players[App.models.currentPlayerIndex];
                const playerServes = player.serves;
                const totalServes = playerServes.length;
                playerServes.forEach((serve, index) => {
                    // Calculate opacity based on serve age
                    const opacity = 0.5 + (0.5 * (index + 1)) / totalServes;
                    App.draw.drawServeOrAttack(serve, opacity);
                });
            }
        },
        
        drawServeOrAttack: function (serve, opacity) {
            const startX = serve.startX * App.canvas.width;
            const startY = serve.startY * App.canvas.height;
            const endX = serve.endX * App.canvas.width;
            const endY = serve.endY * App.canvas.height;
        
            App.draw.drawArrow(startX, startY, endX, endY, App.draw.getColor(serve, opacity));
        },
        
        getColor: function (serve, opacity) {
            let color;
            if (serve.rating === 1) {
                // Positive rating - Red
                color = `rgba(255, 0, 0, ${opacity})`; // Red
            } else if (serve.rating === 0) {
                // Neutral rating - Black
                color = `rgba(0, 0, 0, ${opacity})`; // Black
            } else if (serve.rating === -1) {
                // Negative rating - Brown
                color = `rgba(115, 32, 32, ${opacity})`; // Brown
            } else {
                // Default color for undefined rating - Gray
                color = `rgba(128, 128, 128, ${opacity})`; // Gray
            }
            return color;
        },
        

        drawArrow: function (sx, sy, ex, ey, color) {
            const ctx = App.ctx;
            const headlen = 10;
            const dx = ex - sx;
            const dy = ey - sy;
            const angle = Math.atan2(dy, dx);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineTo(
                ex - headlen * Math.cos(angle - Math.PI / 6),
                ey - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                ex - headlen * Math.cos(angle + Math.PI / 6),
                ey - headlen * Math.sin(angle + Math.PI / 6)
            );
            ctx.lineTo(ex, ey);
            ctx.fill();
        },

        addServe: function (serveData) {
            App.models.teams[App.models.servingTeamIndex].players[App.models.currentPlayerIndex].serves.push(serveData);
            App.draw.drawServes();
        },

        flipCourt: function () {
            App.models.courtFlipped = !App.models.courtFlipped;
            App.models.teams.forEach((team) => {
                team.players.forEach((player) => {
                    player.serves = player.serves.map((serve) => App.draw.rotateServe(serve));
                });
            });
            App.draw.drawServes();
        },

        rotateServe: function (serve) {
            // Rotate around the center point (0.5, 0.5)
            return {
                ...serve,
                startX: 1 - serve.startX,
                startY: 1 - serve.startY,
                endX: 1 - serve.endX,
                endY: 1 - serve.endY,
            };
        },
    };
})();
