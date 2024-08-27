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
		verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "rainbow animation")
	}
	if (policeInterval) {
			clearInterval(policeInterval);
			verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "police animation")
	}
	if (marqueeInterval) {
			clearInterval(marqueeInterval);
			verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "marquee animation")
	}
	if (customFlowInterval) {
			clearInterval(customFlowInterval);
			verboselog(colortext({r:255,g:0,b:0}, "Killed ") + "color flow animation")
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

app.post('/setRainbow', (req, res) => {
killAnimations();
	const {speed, width} = req.body.options;
	let offset = 0;
	function rainbowLoop() {
		offset++
		for (let i = 0; i < numLeds; i++) {
			pixels[i] = colorwheel((i * numLeds + offset) % 255)
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
});


//
// Utility endpoints
//

// connection test endpoint
app.get("/ping", (req, res) => {
    res.status(200).send('Pong! Connection Successful!')
});
// expose number of leds
app.get("/numLeds", (req, res) => { 
    res.status(200).send(numLeds.toString());
});



