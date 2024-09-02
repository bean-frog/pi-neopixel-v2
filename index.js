// Neopixel Controller V2 backend
// (c) 2024 beanfrog
// MIT License


//--------------//
// dependencies //
//--------------//
const { colorwheel, StripType, ws281x } = require('piixel'); // comment this line out for development when not on a Pi if MOCK_PIIXEL doesnt work
const express = require('express');
const path = require('path');
const os = require('os');
const fs = require("fs");
const settings = require('./setup/config.json');

//------------//
// setup/init //
//------------//

// globally scoped settings
const numLeds = settings.number_of_leds;
const port = settings.server_port;
const gpioDataPin = settings.gpio_data_pin;
const verboseLoggingEnabled = settings.verbose_logging;

// animation intervals
let rainbowInterval;
let policeInterval;
let marqueeInterval;
let customFlowInterval;

//kill all animations
function killAnimations() {
	if (rainbowInterval) {
		clearInterval(rainbowInterval);
		rainbowInterval = null;
		verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "rainbow animation");
	}
	if (policeInterval) {
		clearInterval(policeInterval);
		policeInterval = null;
		verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "police animation");
	}
	if (marqueeInterval) {
		clearInterval(marqueeInterval);
		marqueeInterval = null;
		verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "marquee animation");
	}
	if (customFlowInterval) {
		clearInterval(customFlowInterval);
		customFlowInterval = null;
		verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "color flow animation");
	}
}

// wrapper around console.log that checks if verbose logging is enabled
function verboselog(message) {
	if (verboseLoggingEnabled) {
		console.log(message)
	}
}
// string -> colored string (ANSI escape code)
function colortext(color, text) {
    const { r, g, b } = color;
    return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

// piixel conf
// comment this thing out for development when not on a Pi if MOCK_PIIXEL doesnt work
ws281x.configure(
	{
		gpio: gpioDataPin,
		leds: numLeds,
		type: StripType.WS2811_STRIP_RGB,
		resetOnExit: true 
	}
);

const pixels = new Uint32Array(numLeds);


// server conf
const app = express();
app.use(express.json());
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'))
});

//make config accessible to frontend
app.get('/config', (req, res) => {
	res.json(settings)
})

//
// Endpoints for color setting
//

// single led
app.post('/setSingle', (req, res) => {
	killAnimations();
	const color = req.body.color;
	const led = req.body.led;
	const {r, g, b} = color;
	if (led >= 0 && led < numLeds) {
		pixels[led] = (r << 8) | (g << 16) | b;
		ws281x.render(pixels);
		verboselog(`LED ${led} set to ` + colortext(color, `(${r},${g},${b})`))
		res.sendStatus(200);
	} else {
		console.error(colortext({r: 255, g:0, b:0}, `LED ${led} is out of range.`));
		res.status(500).send("Selected LED is out of range.")
	}
});

// whole strip
app.post('/setWhole', (req, res) => {
killAnimations();
    const color = req.body
   const {r, g, b} = color;
    for (i = 0; i < numLeds; i++) {
        pixels[i] = (r << 8) | (g << 16) | b;
    }
    ws281x.render(pixels)
    verboselog("Whole strip set to "+colortext(color, `(${r},${g},${b})`))
    res.sendStatus(200);
})

// custom flow
app.post('/setCustomColorFlow', (req, res) => {
    console.log(req.body.colors)
    res.sendStatus(200)
});

// police lights
app.post('/setPolice', (req, res) => {
    killAnimations();
    const half = Math.floor(numLeds / 2);
    const speed = req.body.options.speed;
    const { includeOrange, extraFlashes } = req.body.options.extra;
    let isRedFirst = true;

    policeInterval = setInterval(() => {
        // Set the initial color for each side
        for (let i = 0; i < numLeds; i++) {
            if (i < half) {
                pixels[i] = isRedFirst ? 0x00FF00 : 0x0000FF; // Green or Blue
            } else {
                pixels[i] = isRedFirst ? 0x0000FF : 0x00FF00; // Blue or Green
            }
        }
        ws281x.render(pixels);

        if (extraFlashes) {
            const flashColor = isRedFirst ? 0x00FF00 : 0x0000FF; // Set flash color based on current side
            const lowBrightness = flashColor >> 1 & 0x7F7F7F; // Calculate mid brightness
            for (let flash = 0; flash < 2; flash++) {
                // Flash one side from mid brightness to high brightness twice
                for (let i = 0; i < half; i++) {
                    if (isRedFirst) {
                        pixels[i] = lowBrightness;
                    } else {
                        pixels[i + half] = lowBrightness;
                    }
                }
                ws281x.render(pixels);

                setTimeout(() => {
                    for (let i = 0; i < half; i++) {
                        if (isRedFirst) {
                            pixels[i] = flashColor;
                        } else {
                            pixels[i + half] = flashColor;
                        }
                    }
                    ws281x.render(pixels);
                }, speed * 50);
            }
        }

        isRedFirst = !isRedFirst; // Switch sides
    }, speed * 100);

    verboselog(colortext({r:0,g:255,b:0}, "Started: ") + `police animation with speed ${speed}, ` + (extraFlashes ? "" : "no ") + "extra flashes, and " + (includeOrange ? "" : "no ") + "orange lights.")
    res.sendStatus(200)
});
app.post('/setRainbow', (req, res) => {
killAnimations();
	const {speed, width} = req.body.options;
	let offset = 0;
	function rainbowLoop() {
	offset++
		for (let i = 0; i < numLeds; i++) {
		const colorIndex = Math.floor((i * numLeds / width + offset) % 255)
		pixels[i] = colorwheel(colorIndex)
		}
		ws281x.render(pixels)
	}
	rainbowInterval = setInterval(rainbowLoop, speed);
	verboselog(colortext({r:0, g:255, b:0}, "Started ") + `rainbow animation with speed ${speed} and width ${width}`)
	res.sendStatus(200);
});

// Start Express server
app.listen(port, () => {
    // Grab user's local IP to display 
    const interfaces = os.networkInterfaces();
    let localIp;
    Object.keys(interfaces).forEach((netInterface) => {
        interfaces[netInterface].forEach((iface) => {
            if (iface.family === "IPv4" && !iface.internal) {
                localIp = iface.address
            }
        })
    })
    console.log(`Server started at port ${port}`);
    console.log(`Access locally: http://localhost:${port}`);
    if (localIp != null) {
        console.log(`Access on network: http://${localIp}:${port}`);
    }
    verboselog("\nVerbose logging enabled!");
    verboselog("NOTE: Speed values are inverted (i.e. 10 is slower than 1)")
});


//
// Utility endpoints
//

// connection test endpoint
app.get("/ping", (req, res) => {
	// TODO: This is UNTESTED <<<<<<<<<<<<<<<<<<<<
	// read proc/cpuinfo to determine if running on a Pi
	
	fs.readFile('/proc/cpuinfo', 'utf8', (err, data) => {
		if (err) {
			console.log(colortext({r:255,g:0,b:0}, "Error ") + "reading /proc/cpuinfo:");
			console.log(err);
		}
		if (data.includes("Pi")) {
			res.status(200).send('Pong! Connection Successful!');
		} else {
			res.status(202).send("Server is working, but should be running on a Raspberry Pi");
		}
	});
});
// expose number of leds
app.get("/numLeds", (req, res) => { 
    res.status(200).send(numLeds.toString());
});



