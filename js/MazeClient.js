var map = null; // The map
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

// Array for markers

var markers = new Array();

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

function clearAllMarkers()
{
    var i;
    console.log("clear all markers");
    for (i in markers) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

function addMarker(colour, location)
{
    //                var marker = new google.maps.Marker({
    //                    position:where,
    //                    map:map,
    //                    icon: './images/red.png'
    //                    
    //                });
    console.log("add marker");
    var iconurl = "./images/" + colour + ".PNG";
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: iconurl
    });
    markers.push(marker);
}

function handleUpdate(msg) {
    console.log("handle update");
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action === "alreadyinuse") {
        alert("Nickname is already in use. Please try again");
        return;
    } else if (info.action === "setupmap") {
        doSetupMap();
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

function doLoadMap() {
    console.log("load map");
    var loginbutton = document.getElementById('loginbutton');
    loginbutton.disabled = true;
    var logoutbutton = document.getElementById('logoutbutton');
    logoutbutton.disabled = false;
    var mapdiv = document.getElementById('mazemap');
    mapdiv.
}

function doMoveCommand() {
    console.log("move command");
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    data.lat = document.getElementById('lat').value;
    data.lng = document.getElementById('lng').value;
    var command = new Object();
    command.action = "Move";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);

}