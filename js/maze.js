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
var grid;

function initMaze(gr) {
    grid = gr;
    rows = 12;
    columns = 12;
    tileSize = 22;
    console.log('initting!!!');
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    // draw it
    drawMaze(grid);
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

function drawMaze(map) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // bg
    context.fillStyle = "#EFEFEF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // maze
    context.fillStyle = "#000000";

    startx = canvas.width / 2 - (4 + columns * tileSize);
    starty = canvas.height / 2 - (4 + rows * tileSize);

    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            var cell = map[y][x];
            if (cell != 0) {
                context.fillRect(startx + tileSize * x, starty + tileSize * y, tileSize, tileSize);
            }
        }
    }
}

function drawPlayers(players) {
    startx = canvas.width / 2 - (4 + columns * tileSize);
    starty = canvas.height / 2 - (4 + rows * tileSize);
    var img = new Image();

    for (var p = 0; p < players.length; p++) {
        context.fillStyle = players[p].colour;
        if (players[p].heading === 'left') {
            img.src = "images/m1.png";
        } else if (players[p].heading === 'right') {
            img.src = "images/m2.png";
        } else if (players[p].heading === 'down') {
            img.src = "images/m3.png";
        } else if (players[p].heading === 'up') {
            img.src = "images/m4.png";
        }
        console.log('player: ', players[p]);
        var cell = grid[players[p].location.y][players[p].location.x];
        if (cell !== 0) {
            context.drawImage(img, startx + tileSize * players[p].location.x,
                    starty + tileSize * players[p].location.y, tileSize, tileSize);
        }
    }
}