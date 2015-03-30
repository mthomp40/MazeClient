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
        alert("Connection closed");
    }
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

function handleUpdate(msg)
{
    console.log("handle update");
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action == "login") {
        console.log("logged in successfully");
    }
}

function doLogin() {
    console.log("login");
    var uname = document.getElementById('uname').value;
    if (uname == "") {
        alert("You must supply a nickname");
        return;
    }
    var data = new Object();
    data.uname = document.getElementById('uname').value;
    var command = new Object();
    command.action = "Login";
    command.data = data;
    var stringversion = JSON.stringify(command);
    socket.send(stringversion);
}

function doLoadMap() {
    console.log("load map");
    var uname = document.getElementById('uname').value;
    if (uname == "") {
        alert("You must supply a name");
        return;
    }
    var lat = document.getElementById('lat').value;
    var lng = document.getElementById('lng').value;
    var where = new google.maps.LatLng(lat, lng);
    var itype = google.maps.MapTypeId.ROADMAP;
    // Lots of options, only a few are mandatory (zoom, center, map type)
    var optionsArray = {
        zoom: 14, // 0-17
        center: where,
        mapTypeId: itype
    };
    var mapdiv = document.getElementById('map');
    map = new google.maps.Map(mapdiv, optionsArray);

    var movebutton = document.getElementById('movebutton');
    movebutton.disabled = false;
    var loadmapbutton = document.getElementById('loadmapbutton');
    loadmapbutton.disabled = true;
    document.getElementById('uname').disabled = true;
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