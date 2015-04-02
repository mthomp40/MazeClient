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
    rows = 8;
    columns = 8;
    tileSize = 30;
    console.log('initting!!!: ', grid);
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    // draw it
    drawMaze();
}

//hide walls
function hideWall(x, y, dir) {
    grid[y][x][dir] = false;
}

//hide opposite wall
function oppHideWall(x, y, dir) {
    var opp;
    if (dir == "s") {
        opp = "n";
    } else if (dir == "n") {
        opp = "s";
    } else if (dir == "e") {
        opp = "w";
    } else if (dir == "w") {
        opp = "e";
    }
    grid[y][x][opp] = false;
}

// neightbours
function neighbours(r, c) {
    var n;
    var s;
    var e;
    var w;

    try {
        var n = grid[r - 1][c];
    }
    catch (err) {
    }
    try {
        var s = grid[r + 1][c];
    }
    catch (err) {
    }
    try {
        var e = grid[r][c + 1];
    }
    catch (err) {
    }
    try {
        var w = grid[r][c - 1];
    }
    catch (err) {
    }

    var empty = [];
    var dirs = [];
    if (n != undefined) {
        if (!n.visited) {
            empty.push(n);
            dirs.push("n");
        }
    }
    if (s != undefined) {
        if (!s.visited) {
            empty.push(s);
            dirs.push("s");
        }
    }
    if (e != undefined) {
        if (!e.visited) {
            empty.push(e);
            dirs.push("e");
        }
    }
    if (w != undefined) {
        if (!w.visited) {
            empty.push(w);
            dirs.push("w");
        }
    }
    if (empty.length) {
        var rn = Math.floor(Math.random() * empty.length);
        var dir = dirs[rn];
        cellstack.push(currentcell);
        hideWall(currentcell.c, currentcell.r, dir);
        currentcell.visited = true;
        currentcell = empty[rn];
        oppHideWall(currentcell.c, currentcell.r, dir);
        currentcell.visited = true;
        visitedcells++;
    } else {
        currentcell = cellstack.pop();
    }
}

function populate() {
    while (visitedcells < (rows * columns) - 1) {
        neighbours(currentcell.r, currentcell.c);
    }
}

function drawMaze() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // bg
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // maze
    context.fillStyle = "#000000";

    startx = canvas.width / 2 - (4 + columns * tileSize);
    starty = canvas.height / 2 - (4 + rows * tileSize);

    for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[y].length; x++) {
            var cell = grid[y][x];
            if (cell != 0) {
                context.fillRect(startx + tileSize * x, starty + tileSize * y, tileSize, tileSize);
            }
        }
    }
}

function drawPlayers(players) {
    startx = canvas.width / 2 - (4 + columns * tileSize);
    starty = canvas.height / 2 - (4 + rows * tileSize);
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
                console.log('player: ', players[p]);
                var cell = grid[players[p].location.y][players[p].location.x];
                if (cell !== 0) {
                    context.drawImage(imgArray[p], startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y, tileSize, tileSize);
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
                    lazerfill = context.createLinearGradient(0, 0, tileSize * 2.5, 0);
                    lazerfill.addColorStop(0, "#ff6600");
                    lazerfill.addColorStop(1, "#ffff00");
                } else if (players[p].heading === 'right') {
                    context.moveTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y + (tileSize / 2));
                    context.lineTo(startx + tileSize * players[p].location.x + (tileSize * 3.5),
                            starty + tileSize * players[p].location.y);
                    context.lineTo(startx + tileSize * players[p].location.x + (tileSize * 3.5),
                            starty + tileSize * players[p].location.y + (tileSize));
                    lazerfill = context.createLinearGradient(0, 0, tileSize, 0);
                    lazerfill.addColorStop(0, "#ffff00");
                    lazerfill.addColorStop(1, "#ff6600");
                } else if (players[p].heading === 'down') {
                    context.moveTo(startx + tileSize * players[p].location.x + (tileSize / 2),
                            starty + tileSize * players[p].location.y + tileSize);
                    context.lineTo(startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y + (tileSize * 3.5));
                    context.lineTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y + (tileSize * 3.5));
                    lazerfill = context.createLinearGradient(0, 0, 0, tileSize * 2.5);
                    lazerfill.addColorStop(0, "#ffff00");
                    lazerfill.addColorStop(1, "#ff6600");
                } else if (players[p].heading === 'up') {
                    context.moveTo(startx + tileSize * players[p].location.x + (tileSize / 2),
                            starty + tileSize * players[p].location.y);
                    context.lineTo(startx + tileSize * players[p].location.x,
                            starty + tileSize * players[p].location.y - (tileSize * 2.5));
                    context.lineTo(startx + tileSize * players[p].location.x + tileSize,
                            starty + tileSize * players[p].location.y - (tileSize * 2.5));
                    lazerfill = context.createLinearGradient(0, tileSize * 2.5, 0, 0);
                    lazerfill.addColorStop(0, "#ff6600");
                    lazerfill.addColorStop(1, "#ffff00");
                }
                context.closePath();
                context.fillStyle = lazerfill;
                context.fill();
            }
        })(p);
    }
}

function isValidMove(location, direction) {
    console.log("location: ", location);
    if (direction === 'left') {
        var cell = grid[location.y][location.x - 1];
        if (location.x > 1 && cell != 1) {
            return true;
        }
    } else if (direction === 'right') {
        var cell = grid[location.y][location.x + 1];
        if (location.x < (grid.length - 2) && cell != 1) {
            return true;
        }
    } else if (direction === 'up') {
        var cell = grid[location.y - 1][location.x];
        if (location.y > 1 && cell != 1) {
            return true;
        }
    } else if (direction === 'down') {
        var cell = grid[location.y + 1][location.x];
        if (location.y < (grid[0].length - 2) && cell != 1) {
            return true;
        }
    }
    return false;
}