//--------------//
// dependencies //
//--------------//
const { colorwheel, StripType, ws281x } = require('piixel');
const express = require('express');
const path = require('path');
const os = require('os');
const settings = require('./setup/config.json');

//------------//
// setup/init //
//------------//

const numLeds = settings.number_of_leds;
const port = settings.server_port;
const gpioDataPin = settings.gpio_data_pin

ws281x.configure(
	{
		gpio: gpioDataPin,
		leds: numLeds,
		type: StripType.WS2811_STRIP_RGB,
		resetOnExit: true 
	}
);

const app = express();
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'))
});
app.use(express.json());


const pixels = new Uint32Array(numLeds);

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

app.post('/setWhole', (req, res) => {
    const color = req.body.color;
    const {r, g, b} = color;
    for (i = 0; i >= numLeds; i++) {
        pixels[i] = (r << 8) | (g << 16) | b;
    }
    ws281x.render(pixels);
    res.sendStatus(200);
})


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

//------------//
// main stuff //
//------------//

// allow frontend to access number of leds (defined in config.json)
app.get("/numLeds", (req, res) => { 
    res.send(numLeds.toString());
});

