const canvas = document.getElementById('court');
const ctx = canvas.getContext('2d');
let players = {};
let currentPlayer = null;

// Threshold to distinguish between a click and a drag
const DRAG_THRESHOLD = 0.01;

const FIELD_SIZE = 0.7;
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
    const courtContainer = document.getElementById('court-container');
    const containerWidth = courtContainer.clientWidth;
    const containerHeight = courtContainer.clientHeight;

    // Calculate canvas size based on aspect ratio and container dimensions
    const aspectRatio = 2; // Width:Height ratio is 2:1
    let canvasWidth, canvasHeight;

    // Adjust for maximum height in landscape orientation
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const maxCourtHeight = isLandscape ? window.innerHeight * 0.7 : containerHeight;

    if (containerWidth / maxCourtHeight > aspectRatio) {
        // Container is wider than the aspect ratio
        canvasHeight = maxCourtHeight;
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
        const serve = { startX: start.x, startY: start.y, endX: end.x, endY: end.y };
        players[currentPlayer].push(serve);
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
            const opacity = 0.2 + (0.9 * (index + 1)) / totalServes;
			drawServeOrAttack(serve.startX, serve.startY, serve.endX, serve.endY, opacity);
        });
    }
}

function drawServeOrAttack(sx, sy, ex, ey, opacity) {
	const startX = sx * canvas.width;
    const startY = sy * canvas.height;
    const endX = ex * canvas.width;
    const endY = ey * canvas.height;

    drawArrow(startX, startY, endX, endY, getColor(sx,opacity));
}
function getColor(sx,opacity){
	if(isAttack(sx)){
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
