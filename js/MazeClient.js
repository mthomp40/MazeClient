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
var map = [
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000"
];

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
    console.log("load map");
    var loginbutton = document.getElementById('loginbutton');
    loginbutton.disabled = true;
    var logoutbutton = document.getElementById('logoutbutton');
    logoutbutton.disabled = false;

    var canvas = document.getElementById("mazecanvas");
    canvas.style.visibility = "visible";
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working

    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    }

}

function initWebGL(canvas) {
    gl = null;
    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) {
    }
    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while (currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        // Unknown shader type
        return null;
    }
    gl.shaderSource(shader, theSource);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function createSquare(gl) {
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var verts = [
        .5, .5, 0.0,
        -.5, .5, 0.0,
        .5, -.5, 0.0,
        -.5, -.5, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var square = {buffer: vertexBuffer, vertSize: 3, nVerts: 4, primtype: gl.TRIANGLE_STRIP};
    return square;
}

function handleUpdate(msg) {
    console.log("handle update");
    var info = JSON.parse(msg.data);
    var infodata = info['data'];
    if (info.action === "alreadyinuse") {
        alert("Nickname is already in use. Please try again");
        return;
    } else if (info.action === "initgame") {
        init();
        //doInitGame();
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