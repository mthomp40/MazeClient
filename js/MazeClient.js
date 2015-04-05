var gl; // A global variable for the WebGL context
var socket = null; // The socket
var url = 'ws://localhost:8000/mazegame';

// Colour map 
var colourmap = new Object();
colourmap.red = "#ff0000";
colourmap.yellow = "#ffff00";
colourmap.blue = "#0000ff";
colourmap.lime = "#00ff00";
colourmap.aqua = "#00ffff";
colourmap.fuschia = "#ff00ff";
colourmap.maroon = "#800000";
colourmap.green = "#008000";
colourmap.navy = "#000080";
var theplayer = null;
var players = new Array();
var heading;
var blocksize = 15;
var mazetype = null;

function Player(player) {
    this.uname = player.uname;
    this.heading = player.heading;
    this.action = player.action;
    this.colourname = player.colourname;
    this.colourval = player.colourval;
    this.location = player.location;
    this.loggedin = player.loggedin;
    this.inplay = player.inplay;
    this.health = player.health;
}

function clearAllPlayers() {
    var i;
    for (i in players) {
        players[i] = null;
    }
    players.length = 0;
}

function addPlayer(uname, heading, action, colourname, colourval, location, loggedin, inplay, health) {
    var player = new Player({
        uname: uname,
        location: location,
        heading: heading,
        action: action,
        colourname: colourname,
        colourval: colourval,
        loggedin: loggedin,
        inplay: inplay,
        health: health
    });
    players.push(player);
}

function doSetupSocket() {
    socket = ("MozWebSocket" in window ? new MozWebSocket(url) : new WebSocket(url));
    socket.onclose = function(msg) {
        alert("Connection closed");
    };
    socket.onmessage = handleUpdate;
}

function handleUpdate(msg) {
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action === "alreadyinuse") {
        alert("Nickname is already in use. Please try again");
        return;
    } else if (info.action === "initgame") {
        var maze2dradio = document.getElementById('2d');
        if (maze2dradio.checked == true) {
            mazetype = 2;
            doInitGame(infodata.maze);
        } else {
            mazetype = 3;
            do3dInitGame(infodata.maze);
        }
        var i;
        var persons = document.getElementById('persons');
        persons.innerHTML = "";
        var str = "";
        for (i in infodata.persons) {
            var clientdata = infodata.persons[i];
            var uname = clientdata['uname'];
            var colourname = clientdata['colour'];
            var colourval = colourmap[colourname];
            str = str + "<font style='color:" + colourval + "'>" + uname + "</font>, ";
        }
        var currenthealth = document.getElementById('currenthealth');
        currenthealth.innerHTML = "10";
        persons.innerHTML = str;
    } else if (info.action === "die") {
        alert(infodata.message);
        var startbutton = document.getElementById('startbutton');
        startbutton.disabled = false;
        var quitbutton = document.getElementById('quitbutton');
        quitbutton.disabled = true;
    } else {
        var i;
        var persons = document.getElementById('persons');
        var currenthealth = document.getElementById('currenthealth');
        persons.innerHTML = "";
        currenthealth.innerHTML = "";
        var str = "";
        clearAllPlayers();
        for (i in infodata) {
            var clientdata = infodata[i];
            var uname = clientdata['uname'];
            var colourname = clientdata['colour'];
            var colourval = colourmap[colourname];
            var location = clientdata['location'];
            var heading = clientdata['heading'];
            var action = clientdata['action'];
            var loggedin = clientdata['loggedin'];
            var inplay = clientdata['inplay'];
            var health = clientdata['health'];
            if (uname === theplayer.uname) {
                theplayer = new Player({
                    uname: uname,
                    location: location,
                    heading: heading,
                    action: action,
                    colourname: colourname,
                    colourval: colourval,
                    loggedin: loggedin,
                    inplay: inplay,
                    health: health
                });
            }
            addPlayer(uname, heading, action, colourname, colourval, location, loggedin, inplay, health);
            str = str + "<font style='color:" + colourval + "'>" + uname + "</font>, ";
        }
        if (mazetype == 2) {
            drawMaze(players);
        } else {
            //draw3dMaze(players);
        }

        persons.innerHTML = str;
        currenthealth.innerHTML = "" + theplayer.health;
    }
}

function doLogin() {
    var uname = document.getElementById('uname').value;
    if (uname === "") {
        alert("You must supply a nickname");
        return;
    }
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    var command = new Object();
    command.action = "login";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}

function doLogout() {
    var uname = document.getElementById('uname');
    uname.value = "";
    var loginbutton = document.getElementById('loginbutton');
    loginbutton.disabled = true;
    var logoutbutton = document.getElementById('logoutbutton');
    logoutbutton.disabled = true;
    var persons = document.getElementById('persons');
    persons.innerHTML = "";
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    var command = new Object();
    command.action = "logout";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}

function doInitGame(data) {
    var uname = document.getElementById('uname');
    theplayer = new Player({
        uname: uname.value,
        location: null,
        heading: null,
        action: null,
        colour: null,
        loggedin: true,
        inplay: false,
        health: 10
    });
    var login = document.getElementById('login');
    login.style.display = "none";
    var controls = document.getElementById('controlswrapper');
    controls.style.visibility = "visible";
    var canvas = document.getElementById('canvaswrapper');
    canvas.style.visibility = "visible";
    var c = document.getElementById('myCanvas');
    c.style.display = "inline-block";
    $(document).keydown(function(event) {
        if (event.which == 37) {
            doMoveCommand('left');
            event.preventDefault();
        } else if (event.which == 39) {
            doMoveCommand('right');
            event.preventDefault();
        } else if (event.which == 38) {
            doMoveCommand('up');
            event.preventDefault();
        } else if (event.which == 40) {
            doMoveCommand('down');
            event.preventDefault();
        } else if (event.which == 32) {
            doMoveCommand('fire');
            event.preventDefault();
        }
    });

    initMaze(data);
}

function do3dInitGame(data) {
    var uname = document.getElementById('uname');
    theplayer = new Player({
        uname: uname.value,
        location: null,
        heading: null,
        action: null,
        colour: null,
        loggedin: true,
        inplay: false,
        health: 10
    });
    var login = document.getElementById('login');
    login.style.display = "none";
    var controls = document.getElementById('controlswrapper');
    //controls.style.visibility = "visible";
    //controls.style.width = "100%";
    //controls.style.float = "left";
    var canvas = document.getElementById('canvaswrapper');
    canvas.style.visibility = "visible";
    canvas.style.width = "100%";
    canvas.style.height = "730px";
    var c = document.getElementById('canvas');
    c.style.display = "inline-block";

    start3dMaze(data);
}

function doStart() {
    var startbutton = document.getElementById('startbutton');
    startbutton.disabled = true;
    var quitbutton = document.getElementById('quitbutton');
    quitbutton.disabled = false;
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    var command = new Object();
    command.action = "start";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}

function doQuit() {
    var startbutton = document.getElementById('startbutton');
    startbutton.disabled = false;
    var quitbutton = document.getElementById('quitbutton');
    quitbutton.disabled = true;
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    var command = new Object();
    command.action = "quit";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}

function doMoveCommand(button) {
    if (theplayer.inplay == true) {
        if (theplayer.heading === button) {
            if (isValidMove(theplayer.location, button)) {
                var data = new Object();
                data.heading = button;
                var command = new Object();
                command.action = "move";
                command.data = data;
                var stringversion = JSON.stringify(command);
                socket.send(stringversion);
            }
        } else if (button === 'fire') {
            var data = new Object();
            data.heading = theplayer.heading;
            var command = new Object();
            command.action = "fire";
            command.data = data;
            var stringversion = JSON.stringify(command);
            socket.send(stringversion);
        } else {
            var data = new Object();
            data.heading = button;
            var command = new Object();
            command.action = "direction";
            command.data = data;
            var stringversion = JSON.stringify(command);
            socket.send(stringversion);
        }
    }
}