// dictionary to hold information about devices
// format = { address: device }
var device_list = {};
var device_id;

// if connecting causes an error, print error
var onConnectedCallback = function() {
    if (chrome.runtime.lastError) {
        console.log("Connection failed: " + chrome.runtime.lastError.message);
    } else {
        // do something else
    }
};

function searchBluetoothDevices() {
    console.log('Requesting bluetooth devices...');
    // find available devices
    chrome.bluetooth.getDevices(function(devices) {
        for (var i = 0; i < devices.length; i++) {
            // add the discovered device to the list
            device_list[devices[i].address] = devices[i];
        }
    });
    console.log(Object.keys(device_list).length + " devices found");
}

function displayDevices() {
    console.log("Displaying devices...");

    // clear the current list of devices
    $("#devices-list").html("");

    // add each device to list
    for (var key in device_list) {
        console.log(key + " " + device_list[key].name);
        var $listElem = $("<li id='" + key + "'>" + device_list[key].name + "</li>");
        $("#devices-list").append($listElem);
    }

    // if >= 1 device is found, display the connect button
    if (Object.keys(device_list).length > 0) {
        $("#connect").show();
    }
}

// Event handler for search button being pressed
// Looks for bluetooth devices and displays them in the window
function findAndDisplay(event) {
    searchBluetoothDevices();
    displayDevices();
}

// Event handler for a device being clicked in list
// Changes colors of list elements to highlight clicked device and
// saves the id of the clicked device for later use
function deviceClicked(event) {
    // change list colors
    $("li").css("background-color", "white");
    $(event.currentTarget).css("background-color", "#dddddd");

    // save current device's id
    device_id = event.currentTarget.id;
    // console.log("Device " + device_id + " clicked");
}

// id is the address of the device to connect to
function connectToDevice(id) {
    // clear error
    // if id is null, display error message
    if (id == null) {
        var errorMessage = "Error: please select a device before trying to connect.";
        throwError("connection", errorMessage);
        return;
    }

    clearErrors();

    console.log("Connecting to device " + id);
    console.log("Device uuids: " + device_list[id].uuids);

    // this is the uuid used by the app
    var uuid = "00001101-0000-1000-8000-00805f9b34fb";

    var serverSocketId;
    chrome.bluetoothSocket.create(function(createInfo) {
        serverSocketId = createInfo.socketId;
        chrome.bluetoothSocket.listenUsingRfcomm(serverSocketId,
            uuid, onConnectedCallback);
        console.log("Connected on socket " + serverSocketId);
        $(".message").remove();
        postMessage("Server-side connection established on socket " +
            serverSocketId);
    });


    // add listener for what to do when connection comples
    chrome.bluetoothSocket.onAccept.addListener(function(acceptInfo) {
        if (acceptInfo.socketId != serverSocketId) {
            return;
        }

        chrome.bluetoothSocket.send(acceptInfo.clientSocketId,
            "hello", onSendCallback);

        // Accepted sockets are initially paused,
        // set the onReceive listener first.
        chrome.bluetoothSocket.onReceive.addListener(onReceive);
        chrome.bluetoothSocket.setPaused(false);
    });

}

// type is an optional argument that indicates which error to remove
function clearErrors(type) {
    // if no type specified, clear all errors
    if (type == null) {
        $(".error").remove();
    }
    else {
        $("#" + type + "-error").remove();
    }
}

// type is where the error came from, ex. 'connection' or 'uuid'
function throwError(type, message) {
    $("#" + type + "-error").remove();
    var $error = $("<div class='error' id='" + type + "-error'>" +
                    "<p>" + message + "</p></div>");
    $(document.body).append($error);
}

function postMessage(message) {
    var $message = $("<div class='message'>" +
                    "<p>" + message + "</p></div>");
    $(document.body).append($message);
}


// These are the things that will happen when the window loads
// Attach event handlers, hide/show elements, etc
document.addEventListener('DOMContentLoaded', function() {
    $("#search").on("click", findAndDisplay);
    // change color of li when clicked
    $("#devices-list").on("click", "li", deviceClicked);

    // hide the connect button but attach the event handler
    // anonymous function used to encapsulate function call with argument
    $("#connect").on("click", { "device_id": device_id }, function() {
        connectToDevice(device_id);
    });
    $("#connect").hide();

    // hide error message for now
    $("#connection-error").hide();

});
