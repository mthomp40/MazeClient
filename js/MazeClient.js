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

var markers = new Array();
var heading;
var blocksize = 15;

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

function doInitGame() {
    console.log("init game");
    var loginbutton = document.getElementById('loginbutton');
    loginbutton.disabled = true;
    var logoutbutton = document.getElementById('logoutbutton');
    logoutbutton.disabled = false;

    initMap();
}

function handleUpdate(msg) {
    console.log("handle update");
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action === "alreadyinuse") {
        alert("Nickname is already in use. Please try again");
        return;
    } else if (info.action === "initgame") {
        doInitGame();
    }
    var i;
    var persons = document.getElementById('persons');
    persons.innerHTML = "";
    var str = "";
    for (i in infodata) {
        var clientdata = infodata[i];
        var cname = clientdata['uname'];
        var colourname = clientdata['colour'];
        var colorval = colourmap[colourname];
        str = str + "<font style='color:" + colorval + "'>" + cname + "</font>, ";
    }
    persons.innerHTML = str;
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

function doMoveCommand(button) {
    console.log("move command");
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    data.heading = heading;
    data.button = button;
    var command = new Object();
    command.action = "Move";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}