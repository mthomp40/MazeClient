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

function Player(player) {
    this.uname = player.uname;
    this.heading = player.heading;
    this.action = player.action;
    this.colour = player.colour;
    this.location = player.location;
}

function clearAllPlayers()
{
    var i;
    console.log("clear all players");
    for (i in players) {
        players[i] = null;
    }
    players.length = 0;
}

function addPlayer(uname, heading, action, colour, location)
{
    console.log("add player");
    var player = new Player({
        uname: uname,
        location: location,
        heading: heading,
        action: action,
        colour: colour
    });
    players.push(player);
    console.log("players: ", players);
}

function doSetupSocket()
{
    // Get a WebSocket - browser dependent!
    socket = ("MozWebSocket" in window ? new MozWebSocket(url) : new WebSocket(url));
    console.log("socket created");
    socket.onclose = function(msg) {
        alert("Logged out");
    };
    socket.onmessage = handleUpdate;
}

function handleUpdate(msg) {
    console.log("handle update");
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action === "alreadyinuse") {
        alert("Nickname is already in use. Please try again");
        return;
    } else if (info.action === "initgame") {
        doInitGame(infodata.maze);
        console.log('else if initgame data: ', infodata);
        var i;
        var persons = document.getElementById('persons');
        persons.innerHTML = "";
        var str = "";
        for (i in infodata.persons) {
            var clientdata = infodata.persons[i];
            var uname = clientdata['uname'];
            var colourname = clientdata['colour'];
            var colourval = colourmap[colourname];
            theplayer = new Player({
                uname: uname,
                location: null,
                heading: null,
                action: null,
                colour: colourval
            });
            str = str + "<font style='color:" + colourval + "'>" + uname + "</font>, ";
        }
        persons.innerHTML = str;
    } else {
        console.log('else data: ', infodata);
        var i;
        var persons = document.getElementById('persons');
        persons.innerHTML = "";
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
            if (uname === theplayer.uname) {
                theplayer = new Player({
                    uname: uname,
                    location: location,
                    heading: heading,
                    action: action,
                    colour: colourval
                });
            }
            addPlayer(uname, heading, action, colourval, location);
            str = str + "<font style='color:" + colourval + "'>" + uname + "</font>, ";
        }
        drawPlayers(players);
        persons.innerHTML = str;
    }
}

function doLogin() {
    console.log("login");
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
    console.log("logout");
    var uname = document.getElementById('uname');
    uname.value = "";
    var loginbutton = document.getElementById('loginbutton');
    loginbutton.disabled = true;
    var logoutbutton = document.getElementById('logoutbutton');
    logoutbutton.disabled = true;
    var persons = document.getElementById('persons');
    persons.innerHTML = "";
    socket.close();
}

function doInitGame(data) {
    console.log("init game");
    var login = document.getElementById('login');
    login.style.display = "none";
    var movement = document.getElementById('movement');
    movement.style.visibility = "visible";
    var actions = document.getElementById('actions');
    actions.style.visibility = "visible";
    var people = document.getElementById('people');
    people.style.visibility = "visible";
    var maze = document.getElementById('myCanvas');
    maze.style.visibility = "visible";

    initMaze(data);
}

function doStart() {
    console.log("doStart");
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

function startGame() {

}

function doMoveCommand(button) {
    console.log("move command");


    var data = new Object();
    data.heading = heading;
    data.button = button;
    var command = new Object();
    command.action = "Move";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}