// app.js

// Initialize the application
App.init.initializeApp();
App.events.initializeEventHandlers();
App.resizeCanvas = function () {
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

    App.canvas.width = canvasWidth;
    App.canvas.height = canvasHeight;

    App.canvas.style.width = canvasWidth + 'px';
    App.canvas.style.height = canvasHeight + 'px';

    App.draw.drawServes();
};

window.addEventListener('resize', App.resizeCanvas);
App.resizeCanvas();
App.draw.drawCourt();

// Attach event listeners for buttons
document.getElementById('add-player').title = 'Add player';
document.getElementById('add-player').addEventListener('click', App.ui.showAddPlayerModal);
document.getElementById('edit-team').title='Edit team';
document.getElementById('edit-team').addEventListener('click', App.ui.showEditTeamModal);
document.getElementById('undo').title='Undo last serve';
document.getElementById('undo').addEventListener('click', App.events.undoLastServe);
document.getElementById('reset').title= 'Reset application';
document.getElementById('reset').addEventListener('click', function () {
    if (confirm('Do you really want to reset the application?')) {
        App.init.initializeApp();
    }
});
document.getElementById('flip').title = 'Teams switch side';
document.getElementById('flip').addEventListener('click', App.draw.flipCourt);

// Save and Load Buttons
document.getElementById('save').title = 'Save data';
document.getElementById('save').addEventListener('click', App.ui.saveData);
document.getElementById('load').title = 'Load team data';
document.getElementById('load').addEventListener('click', App.ui.loadData);

