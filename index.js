//--------------//
// dependencies //
//--------------//

const express = require('express');
const path = require('path');
const os = require('os');
const settings = require('./setup/config.json');

//------------//
// setup/init //
//------------//

const numLeds = settings.number_of_leds;
const port = settings.server_port;

const app = express();

// Start Express server
app.listen(port, () => {
    // Grab user's local IP to display 
    const interfaces = os.networkInterfaces();
    let localIp;
    Object.keys(interfaces).forEach((interface) => {
        interfaces[interface].forEach((iface) => {
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