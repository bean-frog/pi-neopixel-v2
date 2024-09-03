// Neopixel Controller V2 frontend script
// (c) 2024 beanfrog 
// MIT License

//====>
// Variables that may or may not make sense to have here
//====?
let wholeStripColor = {r: 255, g: 255, b:255};
let singleLedColor = {r: 255, g: 255, b:255};

let customColors = {};
let customColorIndex = 0;
let customColorSpeed = 10;

let rainbowSettings = {speed: 10, width: 5};

let policeSettings = {speed: 5, extraFlashes: false};

let marqueeSettings = {speed: 10, color:{r: 255, g: 0, b: 0}};

// ====>
// HTTP Request functions
// ====>

function setWholeStrip(color) {
    fetch('/setWhole', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(color)
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

function setSingleLed(lednum, color) {
    fetch('/setSingle', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({led: lednum, color: color})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error sending single led color to server. response: ' + response);
        }
    })
    .catch(error => {
        console.error(join("Error: ", error))
    })
};

function setCustomColorFlow() {
    fetch('/setCustomColorFlow', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({speed: customColorSpeed, colors: customColors})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error sending custom color flow data to server. response: "+ response)
        }
    })
    .catch(error => {
        console.error("Error: " + error)
    })
};

// currently untested
function setRainbow() {
    fetch('/setRainbow', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({options: rainbowSettings})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error sending rainbow data to server. response: " + response)
        }
    })
    .catch(error => {
        console.error("Error: " + error);
    })
};
// currently untested
function setPolice() {
    fetch("/setPolice", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({options: policeSettings})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error sending police light data to server. response: ' + response);
        }
    })
    .catch(error => {
        console.error("Error: " + error);
    })
}

//currently untested
function setMarquee() {
    fetch('/setMarquee', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({options: marqueeSettings})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error sending marquee data to server. response: " + response);
        }
    })
    .catch(error => {
        console.error("Error: " + error);
    })
}

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

// ping server on load 
document.addEventListener("DOMContentLoaded", async function() {
   const response = await fetch("/ping");
   let status = response.status;
   if (status === 200) {
    document.getElementById("connStatus").innerHTML = "Connected 🟢";
   }
   if (status === 202) {
    window.alert("The server appears to not be running on a Raspberry Pi. This is okay for development.");
    document.getElementById("connStatus").innerHTML = "Server not running on a Pi 🟡"
   }
})

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

// custom colors management stuff

// might switch this to use createElement because it doesnt invoke the html parser but this works for now
const colorOptionTemplate = `
            <span class="flex flex-row items-center m-2">
                <input type="color" class="cci w-6 h-6">
                <button onclick="removeColor(this.parentElement)">&times;</button>
            </span>
        `;

        function updateCustomColors() {
            const colorElements = document.querySelectorAll('.cci');
            customColors = {}; // Reset customColors
            colorElements.forEach((input, index) => {
                const colorValue = input.value;
                // console.log(`Color Value: ${colorValue}`);
                const [ r, g, b ] = hexToRgb(colorValue);
                // console.log(`RGB Values: r=${r}, g=${g}, b=${b}`);
                customColors[index] = { r, g, b }; 
            });
            console.log(customColors)
        }

        function removeColor(element) {
            element.remove();
            updateCustomColors();
        }

        function addColor() {
            document.getElementById("customColorTray").insertAdjacentHTML('beforeend', colorOptionTemplate);
            const newColorInput = document.querySelector('#customColorTray input[type="color"]:last-of-type');
            newColorInput.addEventListener('change', () => {
                updateCustomColors();
            });
            updateCustomColors();
        }
document.getElementById("addCustomColor").addEventListener("click", addColor);
document.getElementById("custom-color-speed").addEventListener('input', function() {
 	customColorSpeed = this.value;
 });
 document.getElementById("rainbow-speed").addEventListener('input', function() {
 	rainbowSettings.speed = this.value;
 });
  document.getElementById("rainbow-width").addEventListener('input', function() {
 	rainbowSettings.width = this.value;
 })

 //police settings
  document.getElementById("police-speed").addEventListener('input', function() {
 	policeSettings.speed = this.value;
 });
  
   document.getElementById("police-flashes").addEventListener('input', function() {
 	if (this.checked) {
 	 		policeSettings.extraFlashes = true;
 	 	} else {
 	 		policeSettings.extraFlashes = false;
 	 	}
 })

