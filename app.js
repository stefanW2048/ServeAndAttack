const canvas = document.getElementById('court');
const ctx = canvas.getContext('2d');
let players = {};
let currentPlayer = null;

// Threshold to distinguish between a click and a drag
const DRAG_THRESHOLD = 0.01;

const FIELD_SIZE = 0.8;
const BORDER_SIZE = 0.5*(1.0 - FIELD_SIZE);

let mouseDownPoint = null;
let clickStartPoint = null;

let flipped = false;

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

drawCourt();

document.getElementById('add-player').addEventListener('click', addPlayer);
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
        y: (clientY - rect.top) / canvas.height
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
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.width / 2; // Maintain 2:1 aspect ratio
    drawServes();
}

function addPlayer() {
    const name = prompt('Enter player name:');
    if (name) {
        if (!players[name]) {
            players[name] = [];
            currentPlayer = name;
            addPlayerButton(name);
            updatePlayerButtons();
            drawServes();
        } else {
            alert('Player already exists.');
        }
    }
}

function addPlayerButton(name) {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => {
        currentPlayer = name;
        updatePlayerButtons();
        drawServes();
    });
    document.getElementById('player-buttons').appendChild(btn);
}

function updatePlayerButtons() {
    const buttons = document.getElementById('player-buttons').children;
    for (let btn of buttons) {
        btn.classList.toggle('active', btn.textContent === currentPlayer);
    }
}

/* Unified Event Handling Functions */

function handleStart(e) {
    e.preventDefault();
    if (!currentPlayer) {
        addPlayer();
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
        drawArrow(
            clickStartPoint.x * canvas.width,
            clickStartPoint.y * canvas.height,
            currentPosition.x * canvas.width,
            currentPosition.y * canvas.height,
            'blue'
        );
        return;
    }

    if (mouseDownPoint != null) {
        drawServes();
        drawArrow(
            mouseDownPoint.x * canvas.width,
            mouseDownPoint.y * canvas.height,
            currentPosition.x * canvas.width,
            currentPosition.y * canvas.height,
            'blue'
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
    if (isValidServe(start.x, end.x)) {
        const serve = { startX: start.x, startY: start.y, endX: end.x, endY: end.y };
        players[currentPlayer].push(serve);
    } else {
        alert('Invalid serve');
    }
	drawServes();
}

function isValidServe(sx, ex) {
    if (!flipped) {
        return sx < 0.5 && ex > 0.5;
    } else {
        return sx > 0.5 && ex < 0.5;
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

    // Draw additional rectangle that is 10% smaller than the main rectangle

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
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    const ownFieldLeft = flipped; // When flipped, own field is on the left

    // Positions for labels at 1/3 and 2/3 horizontally in own field
    const oneThirdX = ownFieldLeft ? canvas.width / 6 : canvas.width * (5 / 6);
    const twoThirdX = ownFieldLeft ? canvas.width / 3 : canvas.width * (2 / 3);

    const positionsY = [canvas.height / 6, midY, (5 * canvas.height) / 6];

    // Draw opponent label
    if (!ownFieldLeft) {
        ctx.fillText('Opponent', 10, 20);
    } else {
        ctx.fillText('Opponent', canvas.width - 90, 20);
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
            { num: '1', x: oneThirdX, y: positionsY[0] },
            { num: '2', x: twoThirdX, y: positionsY[0] },
            { num: '6', x: oneThirdX, y: positionsY[1] },
            { num: '3', x: twoThirdX, y: positionsY[1] },
            { num: '5', x: oneThirdX, y: positionsY[2] },
            { num: '4', x: twoThirdX, y: positionsY[2] },
        ];
    }
    positions.forEach(pos => {
        ctx.fillText(pos.num, pos.x - 8, pos.y);
    });
}

function drawServes() {
    drawCourt();
    if (currentPlayer) {
        const playerServes = players[currentPlayer];
        const totalServes = playerServes.length;
        playerServes.forEach((serve, index) => {
            // Calculate opacity based on serve age
            const opacity = 0.3 + (0.7 * (index + 1)) / totalServes;
            const color = `rgba(255, 0, 0, ${opacity})`;

            // Convert relative coordinates back to actual coordinates
            const startX = serve.startX * canvas.width;
            const startY = serve.startY * canvas.height;
            const endX = serve.endX * canvas.width;
            const endY = serve.endY * canvas.height;

            drawArrow(startX, startY, endX, endY, color);
        });
    }
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
    if (currentPlayer && players[currentPlayer].length > 0) {
        players[currentPlayer].pop();
        drawServes();
    }
}

function resetApp() {
    if (confirm('Do you really want to reset the application?')) {
        players = {};
        currentPlayer = null;
        document.getElementById('player-buttons').innerHTML = '';
        drawCourt();
    }
}

function flipCourt() {
    flipped = !flipped;
    // Rotate serves coordinates
    for (let player in players) {
        players[player] = players[player].map(serve => rotateServe(serve));
    }
    drawServes();
}

function rotateServe(serve) {
    // Rotate around the center point (0.5, 0.5)
    return {
        startX: 1 - serve.startX,
        startY: 1 - serve.startY,
        endX: 1 - serve.endX,
        endY: 1 - serve.endY,
    };
}
