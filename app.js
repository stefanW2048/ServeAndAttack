const canvas = document.getElementById('court');
const ctx = canvas.getContext('2d');
let teams = [];
let currentTeamIndex = 0;
let currentPlayerIndex = null;

// Threshold to distinguish between a click and a drag
const DRAG_THRESHOLD = 0.01;

const FIELD_SIZE = 0.7;
const BORDER_SIZE = 0.5 * (1.0 - FIELD_SIZE);

let mouseDownPoint = null;
let clickStartPoint = null;

let flipped = false;

window.addEventListener('resize', resizeCanvas);

document.getElementById('add-player').addEventListener('click', showAddPlayerModal);
document.getElementById('edit-team').addEventListener('click', showEditTeamModal);
document.getElementById('undo').addEventListener('click', undoLastServe);
document.getElementById('reset').addEventListener('click', resetApp);
document.getElementById('flip').addEventListener('click', flipCourt);

// Unified event listeners for both mouse and touch events
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);

initializeApp();
resizeCanvas();
drawCourt();


function initializeApp() {

    const team1Name = 'Lenting';
    const team2Name = 'TV Ingolstadt';

    const debug = true;
    if (!debug) {
        team1Name = prompt('Enter the name of Team 1:');
        team2Name = prompt('Enter the name of Team 2:');
    }


    if (team1Name && team2Name) {
        teams = [
            {
                teamName: team1Name,
                players: [],
            },
            {
                teamName: team2Name,
                players: [],
            },
        ];
        currentTeamIndex = 0;
        currentPlayerIndex = null;
        addTeamButtons();
        updateTeamButtons();
        drawCourt(); // Update the court to display the new team names
    } else {
        alert('Both team names are required.');
        initializeApp(); // Restart initialization if names are not provided
    }
}


function addTeamButtons() {
    const teamButtonsContainer = document.getElementById('team-buttons');
    teamButtonsContainer.innerHTML = ''; // Clear existing buttons

    teams.forEach((team, index) => {
        const btn = document.createElement('button');
        btn.textContent = team.teamName;
        btn.addEventListener('click', () => {
            currentTeamIndex = index;
            currentPlayerIndex = null; // Reset current player
            updateTeamButtons();
            updatePlayerButtons();
            drawServes();
        });
        teamButtonsContainer.appendChild(btn);
    });
}

function updateTeamButtons() {
    const buttons = document.getElementById('team-buttons').children;
    for (let i = 0; i < buttons.length; i++) {
        const isActive = i === currentTeamIndex;
        buttons[i].classList.toggle('active', isActive);
        const teamName = teams[i].teamName;
        if (isActive) {
            buttons[i].textContent = '🏐 ' + teamName; // Add volleyball emoji
        } else {
            buttons[i].textContent = teamName; // No emoji for inactive teams
        }
    }
}


// Helper function to get the current position from mouse or touch event
function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: (clientX - rect.left) / canvas.width,
        y: (clientY - rect.top) / canvas.height,
    };
}

// Helper function to calculate deltaX
function deltaX(a, b) {
    return Math.abs(a.x - b.x);
}

// Function to determine if the action is a drag
function isDrag(a, b) {
    return deltaX(a, b) > DRAG_THRESHOLD;
}

function resizeCanvas() {
    const courtContainer = document.getElementById('court-container');
    const containerWidth = courtContainer.clientWidth;
    const containerHeight = courtContainer.clientHeight;

    // Calculate canvas size based on aspect ratio and container dimensions
    const aspectRatio = 2; // Width:Height ratio is 2:1
    let canvasWidth, canvasHeight;

    if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than the aspect ratio
        canvasHeight = containerHeight;
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        // Container is taller than the aspect ratio
        canvasWidth = containerWidth;
        canvasHeight = canvasWidth / aspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';

    drawServes();
}

function showAddPlayerModal() {
    // Show the modal
    const modal = document.getElementById('add-player-modal');
    modal.style.display = 'block';

    // Set the modal title to include the team name
    const teamName = teams[currentTeamIndex].teamName;
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
            addPlayer(number, name);
            modal.style.display = 'none';
            document.getElementById('add-player-form').reset();
        } else {
            alert('Please enter both number and name.');
        }
    };
}


function addPlayer(number, name) {
    const team = teams[currentTeamIndex];
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
        currentPlayerIndex = team.players.length - 1;
        updatePlayerButtons();
        drawServes();
    }
}

function showEditTeamModal() {
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
        updatePlayerButtons();
    };

    // Generate player list for editing
    const playersDiv = document.getElementById('edit-team-players');
    playersDiv.innerHTML = ''; // Clear existing content

    const team = teams[currentTeamIndex];
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

        playerDiv.appendChild(document.createTextNode('Number: '));
        playerDiv.appendChild(numberInput);
        playerDiv.appendChild(document.createTextNode(' Name: '));
        playerDiv.appendChild(nameInput);

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
}

function updatePlayerButtons() {
    const playerButtonsContainer = document.getElementById('player-buttons');
    playerButtonsContainer.innerHTML = ''; // Clear existing buttons

    if (currentTeamIndex !== null) {
        const players = teams[currentTeamIndex].players;
        players.forEach((player, index) => {
            const btn = document.createElement('button');
            const isActive = index === currentPlayerIndex;

            // Set button text: volleyball emoji + number if active, else just number
            if (isActive) {
                btn.textContent = '🏐 ' + player.number; // Active player with emoji
            } else {
                btn.textContent = player.number; // Inactive player
            }

            btn.title = player.name; // Show player name as tooltip
            btn.addEventListener('click', () => {
                currentPlayerIndex = index;
                updatePlayerButtons();
                drawServes();
            });
            btn.classList.toggle('active', isActive);
            playerButtonsContainer.appendChild(btn);
        });
    }
}



/* Unified Event Handling Functions */

function handleStart(e) {
    e.preventDefault();
    if (currentPlayerIndex === null) {
        showAddPlayerModal();
        return;
    }
    const currentPosition = getEventPos(e);

    if (clickStartPoint !== null) {
        drawLine(clickStartPoint, currentPosition);
        clickStartPoint = null;
        mouseDownPoint = null;
    } else {
        mouseDownPoint = currentPosition;
    }
}

function handleMove(e) {
    e.preventDefault();
    const currentPosition = getEventPos(e);

    if (clickStartPoint != null) {
        drawServes();
        drawServeOrAttack(
            clickStartPoint.x,
            clickStartPoint.y,
            currentPosition.x,
            currentPosition.y,
            1.0
        );
        return;
    }

    if (mouseDownPoint != null) {
        drawServes();
        drawServeOrAttack(
            mouseDownPoint.x,
            mouseDownPoint.y,
            currentPosition.x,
            currentPosition.y,
            1.0
        );
        return;
    }
}

function handleEnd(e) {
    e.preventDefault();
    const currentPosition = getEventPos(e);

    if (mouseDownPoint !== null) {
        if (isDrag(mouseDownPoint, currentPosition)) {
            drawLine(mouseDownPoint, currentPosition);
            mouseDownPoint = null;
        } else {
            clickStartPoint = mouseDownPoint;
        }
    }
}

function drawLine(start, end) {
    if (isValidLine(start.x, end.x)) {
        const serve = {
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            rating: 0, // default rating
            timestamp: new Date(),
        };
        teams[currentTeamIndex].players[currentPlayerIndex].serves.push(serve);
    }
    drawServes();
}

function isValidLine(sx, ex) {
    if (!flipped) {
        return sx < 0.5 && ex > 0.5;
    } else {
        return sx > 0.5 && ex < 0.5;
    }
}

function isAttack(xStart) {
    if (!flipped) {
        return xStart > 0.25;
    } else {
        return xStart < 0.75;
    }
}

function drawCourt() {
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
    const insetX = canvas.width * BORDER_SIZE;
    const insetY = canvas.height * BORDER_SIZE;
    const innerWidth = canvas.width * FIELD_SIZE;
    const innerHeight = canvas.height * FIELD_SIZE;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(insetX, insetY, innerWidth, innerHeight);

    // Draw labels
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';

    const ownFieldLeft = flipped; // When flipped, own field is on the left

    // Define field boundaries
    const fieldLeft = insetX;
    const fieldRight = insetX + innerWidth;
    const fieldTop = insetY;
    const fieldBottom = insetY + innerHeight;

    // Define own field boundaries
    let ownFieldLeftX, ownFieldRightX;
    if (ownFieldLeft) {
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
    const textWidthA = ctx.measureText(teams[0].teamName).width;
    const textWidthB = ctx.measureText(teams[1].teamName).width;
    const padding = 10;

    if (!ownFieldLeft) {
        ctx.fillText(teams[0].teamName, padding, 20);
        ctx.fillText(teams[1].teamName, canvas.width - textWidthB - padding, 20);
    } else {
        ctx.fillText(teams[1].teamName, padding, 20);
        ctx.fillText(teams[0].teamName, canvas.width - textWidthA - padding, 20);
    }

    // Own side positions
    let positions;
    if (ownFieldLeft) {
        // Own field is on the left
        // Labels: from top to bottom: 5 4, 6 3, 1 2
        positions = [
            { num: '5', x: oneThirdX, y: positionsY[0] },
            { num: '4', x: twoThirdX, y: positionsY[0] },
            { num: '6', x: oneThirdX, y: positionsY[1] },
            { num: '3', x: twoThirdX, y: positionsY[1] },
            { num: '1', x: oneThirdX, y: positionsY[2] },
            { num: '2', x: twoThirdX, y: positionsY[2] },
        ];
    } else {
        // Own field is on the right
        // Labels: from top to bottom: 1 2, 6 3, 5 4
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
}

function drawServes() {
    drawCourt();
    if (currentPlayerIndex !== null) {
        const player = teams[currentTeamIndex].players[currentPlayerIndex];
        const playerServes = player.serves;
        const totalServes = playerServes.length;
        playerServes.forEach((serve, index) => {
            // Calculate opacity based on serve age
            const opacity = 0.2 + (0.9 * (index + 1)) / totalServes;
            drawServeOrAttack(
                serve.startX,
                serve.startY,
                serve.endX,
                serve.endY,
                opacity
            );
        });
    }
}

function drawServeOrAttack(sx, sy, ex, ey, opacity) {
    const startX = sx * canvas.width;
    const startY = sy * canvas.height;
    const endX = ex * canvas.width;
    const endY = ey * canvas.height;

    drawArrow(startX, startY, endX, endY, getColor(sx, opacity));
}

function getColor(sx, opacity) {
    if (isAttack(sx)) {
        return `rgba(255, 0, 0, ${opacity})`;
    }
    return `rgba(0, 0, 255, ${opacity})`;
}

function drawArrow(sx, sy, ex, ey, color) {
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
}

function undoLastServe() {
    if (currentPlayerIndex !== null) {
        const player = teams[currentTeamIndex].players[currentPlayerIndex];
        if (player.serves.length > 0) {
            player.serves.pop();
            drawServes();
        }
    }
}

function resetApp() {
    if (confirm('Do you really want to reset the application?')) {
        teams.forEach((team) => {
            team.players = [];
        });
        currentPlayerIndex = null;
        updatePlayerButtons();
        drawCourt();
    }
}

function flipCourt() {
    flipped = !flipped;
    teams.forEach((team) => {
        team.players.forEach((player) => {
            player.serves = player.serves.map((serve) => rotateServe(serve));
        });
    });
    drawServes();
}

function rotateServe(serve) {
    // Rotate around the center point (0.5, 0.5)
    return {
        ...serve,
        startX: 1 - serve.startX,
        startY: 1 - serve.startY,
        endX: 1 - serve.endX,
        endY: 1 - serve.endY,
    };
}
