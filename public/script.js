// Neopixel Controller V2 frontend script
// (c) 2024 beanfrog 

//====>
// Variables that may or may not make sense to have here
//====?
let wholeStripColor = {r: 255, g: 255, b:255};
let singleLedColor = {r: 255, g: 255, b:255};

//====>
// HTTP Request functions
//====>

function setWholeStrip() {
    fetch('/setWhole', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(wholeStripColor)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error sending whole strip color to server. response: ' + response);
        }
    })
    .catch(error => {
        console.error("Error: " + error)
    })
};

function setSingleLed(lednum) {
    fetch('/setSingle', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(singleLedColor)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error sending single led color to server. response: ' + response);
        }
    })
    .catch(error => {
        console.error("Error: " + error)
    })
};


//====>
// Helper Functions
//====>

// get number of available leds
async function getNumLeds() {
    try {
        const response = await fetch('/numLeds');
        if (!response.ok) {
            throw new Error('Error getting number of leds. Response: ' + response);
        }
        const data = await response.json();
        document.getElementById("numLeds").innerHTML = data + " (IDs: 0 - " + (data - 1) + ")";
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};
getNumLeds();
// thanks SO :) https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb/26583079
function rgbToHex(red, green, blue) {
    var out = '#';

    for (var i = 0; i < 3; ++i) {
        var n = typeof arguments[i] == 'number' ? arguments[i] : parseInt(arguments[i]);

        if (isNaN(n) || n < 0 || n > 255) {
            return false;
        }

        out += (n < 16 ? '0' : '') + n.toString(16);
    }
    return out
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}


//====>
// UI Stuff
//====>

// whole strip color sliders and color selector
document.getElementById('whole-strip-color-sliders').addEventListener('input', function(event) {
    if (event.target.matches('input[type="range"]')) {
        const red = document.getElementById('whole-red').value;
        const green = document.getElementById('whole-green').value;
        const blue = document.getElementById('whole-blue').value;
        const color = rgbToHex(red, green, blue)
        document.getElementById('whole-display').value = color;
        wholeStripColor = {r: red, g: green, b: blue} //globally accessible whole strip color value
    }
});

document.getElementById('whole-display').addEventListener('input', function(event) {
    const color = event.target.value;  
    const [red, green, blue] = hexToRgb(color); 
    document.getElementById('whole-red').value = red;
    document.getElementById('whole-green').value = green;
    document.getElementById('whole-blue').value = blue;
    wholeStripColor = {r: red, g: green, b: blue} //globally accessible whole strip color value
});

// single led color sliders and color selector
document.getElementById('single-led-color-sliders').addEventListener('input', function(event) {
    if (event.target.matches('input[type="range"]')) {
        const red = document.getElementById('single-red').value;
        const green = document.getElementById('single-green').value;
        const blue = document.getElementById('single-blue').value;
        const color = rgbToHex(red, green, blue)
        document.getElementById('single-display').value = color;
        singleLedColor = {r: red, g: green, b: blue} //globally accessible single led color value
    }
});

document.getElementById('single-display').addEventListener('input', function(event) {
    const color = event.target.value;  
    const [red, green, blue] = hexToRgb(color); 
    document.getElementById('single-red').value = red;
    document.getElementById('single-green').value = green;
    document.getElementById('single-blue').value = blue;
    singleLedColor = {r: red, g: green, b: blue} //globally accessible single led color value
});


