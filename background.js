/*
 * A chrome extension that connects to a device over bluetooth
 * and receives a file from the device
 *
 * Developed by Aakash Patel and Saad Mallick
 * Version 1.0
 * July 2018
 */
 
var onConnectedCallback = function() {
    if (chrome.runtime.lastError) {
        console.log("Connection failed: " + chrome.runtime.lastError.message);
    } else {
        // do something else
    }
};

// converts a string to an array buffer
var stringToBuffer = function(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// start script on launch
chrome.app.runtime.onLaunched.addListener(function() {
    // creates a window
    chrome.app.window.create('window.html', {
        'outerBounds': {
            'width': 360,
            'height': 480
        }
    });

    // get adapter information
    chrome.bluetooth.getAdapterState(function(adapter) {
        console.log("Adapter " + adapter.address + ": " + adapter.name);
    });
});
