/**
 * @author Klas Kroon, North Kingdom / http://oos.moxiecode.com/
 * Modified by Mark Thompson 1/4/15
 */

var context;
var canvas;
var rows = null;
var columns = null;
var tileSize = null;
var startx = 0;
var starty = 0;
var cellstack = [];
var grid = [];
var currentcell;
var visitedcells = 0;

function initMaze(gr) {
    grid = gr;
    rows = grid.length;
    columns = grid[0].length;
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    tileSize = context.canvas.width / grid[0].length;
    var players = [];
    drawMaze(players);
}

function drawMaze(players) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    var floorimg = new Image();
    floorimg.src = "images/floor.jpg";
    var brickimg = new Image();
    brickimg.src = "images/brick.jpg";
    floorimg.onload = function() {
        for (var y = 0; y < grid.length; y++) {
            for (var x = 0; x < grid[y].length; x++) {
                context.drawImage(floorimg, tileSize * x, tileSize * y, tileSize, tileSize);
            }
        }
        brickimg.onload = function() {
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {
                    var cell = grid[y][x];
                    if (cell != 0) {
                        context.drawImage(brickimg, tileSize * x, tileSize * y, tileSize, tileSize);
                    }
                }
            }
            drawPlayers(players);
        }
    }
}

function drawPlayers(players) {
    var imgArray = [];
    for (var p = 0; p < players.length; p++) {
        (function(p) {
            imgArray[p] = new Image();
            if (players[p].heading === 'left') {
                imgArray[p].src = "images/man1_" + players[p].colourname + ".png";
            } else if (players[p].heading === 'right') {
                imgArray[p].src = "images/man2_" + players[p].colourname + ".png";
            } else if (players[p].heading === 'down') {
                imgArray[p].src = "images/man3_" + players[p].colourname + ".png";
            } else if (players[p].heading === 'up') {
                imgArray[p].src = "images/man4_" + players[p].colourname + ".png";
            }
            imgArray[p].onload = function() {
                var cell = grid[players[p].location.y][players[p].location.x];
                if (cell !== 0) {
                    context.drawImage(imgArray[p], tileSize * players[p].location.x,
                            tileSize * players[p].location.y, tileSize, tileSize);
                }
            };
            if (players[p].action === 'fire') {
                context.beginPath();
                var lazerfill;
                if (players[p].heading === 'left') {
                    context.moveTo(startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y + (tileSize / 2));
                    context.lineTo(startx + tileSize * players[p].location.x - (tileSize * 2.5),
                            starty + tileSize * players[p].location.y);
                    context.lineTo(startx + tileSize * players[p].location.x - (tileSize * 2.5),
                            starty + tileSize * players[p].location.y + (tileSize));
                    lazerfill = context.createLinearGradient(startx + tileSize * players[p].location.x,
                            0, startx + tileSize * players[p].location.x - (tileSize * 2.5), 0);
                } else if (players[p].heading === 'right') {
                    context.moveTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y + (tileSize / 2));
                    context.lineTo(startx + tileSize * players[p].location.x + (tileSize * 3.5),
                            starty + tileSize * players[p].location.y);
                    context.lineTo(startx + tileSize * players[p].location.x + (tileSize * 3.5),
                            starty + tileSize * players[p].location.y + (tileSize));
                    lazerfill = context.createLinearGradient(startx + tileSize * players[p].location.x + tileSize, 0,
                            startx + tileSize * players[p].location.x + (tileSize * 3.5), 0);
                } else if (players[p].heading === 'down') {
                    context.moveTo(startx + tileSize * players[p].location.x + (tileSize / 2),
                            starty + tileSize * players[p].location.y + tileSize);
                    context.lineTo(startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y + (tileSize * 3.5));
                    context.lineTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y + (tileSize * 3.5));
                    lazerfill = context.createLinearGradient(0, starty + tileSize * players[p].location.y + tileSize,
                            0, starty + tileSize * players[p].location.y + (tileSize * 3.5));
                } else if (players[p].heading === 'up') {
                    context.moveTo(startx + tileSize * players[p].location.x + (tileSize / 2),
                            starty + tileSize * players[p].location.y);
                    context.lineTo(startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y - (tileSize * 2.5));
                    context.lineTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y - (tileSize * 2.5));
                    lazerfill = context.createLinearGradient(0, starty + tileSize * players[p].location.y,
                            0, starty + tileSize * players[p].location.y - (tileSize * 2.5));
                }
                context.closePath();
                lazerfill.addColorStop(0, "#ffff00");
                lazerfill.addColorStop(1, "#ff8800");
                context.fillStyle = lazerfill;
                context.fill();
            }
        })(p);
    }
}

function isValidMove(location, direction) {
    var cell;
    if (direction === 'left') {
        if (location.x === 0) {
            cell = grid[location.y][grid[location.y].length - 1];
        } else {
            cell = grid[location.y][location.x - 1];
        }
        if (cell != 1) {
            return true;
        }
    } else if (direction === 'right') {
        if (location.x === grid[location.y].length - 1) {
            cell = grid[location.y][0];
        } else {
            cell = grid[location.y][location.x + 1];
        }
        if (cell != 1) {
            return true;
        }
    } else if (direction === 'up') {
        if (location.y === 0) {
            cell = grid[grid.length - 1][location.x];
        } else {
            cell = grid[location.y - 1][location.x];
        }
        if (cell != 1) {
            return true;
        }
    } else if (direction === 'down') {
        if (location.y === grid.length - 1) {
            cell = grid[0][location.x];
        } else {
            cell = grid[location.y + 1][location.x];
        }
        if (cell != 1) {
            return true;
        }
    }
    return false;
}