//--------------//
// dependencies //
//--------------//
const { colorwheel, StripType, ws281x } = require('piixel'); // comment this line out for development when not on a Pi
const express = require('express');
const path = require('path');
const os = require('os');
const settings = require('./setup/config.json');

//------------//
// setup/init //
//------------//

const numLeds = settings.number_of_leds;
const port = settings.server_port;
const gpioDataPin = settings.gpio_data_pin;
const verboseLoggingEnabled = settings.verbose_logging;

// verbose logging
function verboselog(message) {
	if (verboseLoggingEnabled) {
		console.log(message)
	}
}
// string -> colored string (ANSI escape code)
function colortext(color, text) {
	const {r, g, b} = colorl
	//todo
}

// piixel conf
// comment this thing out for development when not on a Pi
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
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'))
});
app.use(express.json());


//
// Endpoints for color setting
//

// single led
app.post('/setSingle', (req, res) => {
	const color = req.body.color;
	const led = req.body.led;
	const {r, g, b} = color;
	if (led >= 0 && led < numLeds) {
		pixels[led] = (r << 8) | (g << 16) | b;
		ws281x.render(pixels);
		res.sendStatus(200);
	} else {
		console.error("LED id out of range");
		res.status(500).send("Selected LED is out of range.")
	}
});

// whole strip
app.post('/setWhole', (req, res) => {

    const color = req.body

   const {r, g, b} = color;
   console.log(color)
    for (i = 0; i < numLeds; i++) {
        pixels[i] = (r << 8) | (g << 16) | b;
    }
   
    ws281x.render(pixels)
    res.sendStatus(200);
})

// custom flow
app.post('/setCustomColorFlow', (req, res) => {
    console.log(req.body.colors)
    res.sendStatus(200)
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

// connection test endpoint
app.get("/ping", (req, res) => {
    res.status(200).send('Pong! Connection Successful!')
});
// expose number of leds
app.get("/numLeds", (req, res) => { 
    res.status(200).send(numLeds.toString());
});



