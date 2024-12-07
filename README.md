# pi-neopixel-2
#### Video Demo: 
#### Description:
A Raspberry Pi based NeoPixel controller 

## Explanation
This explanation is a requirement for CS50x, the course that I write this project for. If you just want to try this project out, installation instructions can be found below.

This project allows you to control individually addressable LEDs (i.e. Neopixels) over a network using HTTP. It is written primarily in Javascript, and contains two main parts: A HTTP server and a webpage.

### HTTP Server
The HTTP server is written in Javascript on the Node.js runtime, which allows it to run on a server rather than being contained to the browser. I chose this for the backend because I knew off the top of my head all of the things I would need to do and (roughly) how to do them. Javascript on the server is not known for its outstanding performance, though because of the non-demanding nature of this project this is not an issue. A higher load implementation of this project might use a language like C, Rust, or Go for the backend, which I may explore in the future.
The server uses the Express library, and defines several POST endpoints for various color functions, and a few GET endpoints for both the website component and certain values for the frontend to access. The `/setSingle` and `/setWhole` endpoints are used to set single LEDs and the whole strip respectively to a static color. They recieve an RGB color formatted as JSON, and `/setSingle` receives a numerical ID corresponding to the LED they want to enable. Several endpoints for animations are available as well:
- `/setMarquee`: a theatre marquee effect. Takes an RGB color, speed, and gap values.
- `/setCustomColorFlow`: a chasing effect using n user defined colors. Takes an array of RGB colors and a speed value.
- `/setRainbow` is similar to `/setCustomColorFlow` but uses the colors of the rainbow instead of user defined colors
- `/setPolice` is a red and blue alternating pattern that resembles a police light. It takes a speed value.

Each animation endpoint will forcefully kill any other running animations before running in order to prevent fighting and blocking.
The server also has an option to verbosely log any events that happen. This feature has 2 associated functions: `verboselog()` and `colortext()`. `verboselog` is simply a wrapper around Javascript's `console.log` method, and checks if logging is enabled before sending a message. `colortext` converts a given RGB color value into an ANSI escape code and returns this code concatenated with a given message as a string. This is used to log colors to the console, which show up in any terminal emulator that supports it.
When the server is started, it serves the webpage (which is under `public/`) and exposes an endpoint called `ping`. When the webpage is visited, it GETs this endpoint and when it does this, the server reads a Linux system file called `/proc/cpuinfo` to determine whether or not it is running on a Raspberry Pi. It sends back a corresponding status code, which the website interprets and renders accordingly.

### Website
The website is written in HTML, and is styled using TailwindCSS and some components from Daisy UI. It uses a responsive "bento box" style layout, with a header and 2 body panels. The header has a title (as they usually do), and displays the server status based on the return code of GETting `/ping`, and the number of LEDs in the strip, which is defined by the user in the config file.
The panels correspond to simple effects (single and whole strip colors) and advanced effects (animated effects). Each section has cards with sliders and other inputs to configure the effect, and a button to activate it. The state of each effect's controls is kept track of in several globally scoped objects which are sent when the user selects an effect.
### Other comments
The server is accessible from any device on the same network, and the local IP of the Pi is displayed on startup in the console along with the port. However, you can also control it from anywhere using port forwarding if you know your home IP address and configure the router correctly. Because exposing ports to the internet without proper precautions, and because the server is not intended for this use (nor has it been tested against various attack methods), instructions to do this will not be provided and doing this is at your own risk.

## Technologies used
- HTML
- Javascript
- NodeJS
- ExpressJS
- Tailwind CSS
- [piixel](https://github.com/bjoerge/piixel) 


## Hardware setup
- Connect the positive lead to one of the 5v pins on the Pi, and the negative to GND.
- It is recommended, but not required, to use a diode (i.e. IN4001) on the 5v lead and a 300-500ohm resistor on the data-in lead.
- Connect the data-in lead to the pin defined in `setup/config.json`
## Software setup
- Install and set up Raspbian (Raspberry Pi OS) using the [instructions on the RaspberryPi website ](https://www.raspberrypi.com/software/). 
- Install NodeJS: `sudo apt-get install node`
- Optionally, install the GitHub CLI: `sudo apt-get install gh`
- Clone this repository (`gh repo clone bean-frog/pi-neopixel-v2`), or download and unzip with the green button at the top of the repo
- From the project root (`cd pi-neopixel-v2`), install dependencies with `npm install` 
- Start the program with `sudo node index.js`. On the Raspberry Pi, the GPIO pins are protected, and thus the program needs to be run with root permissions (`sudo`)
- If you want the program to run every time the Pi is powered on and connected to a network, you can use a systemd service.
- Create and open a service file: `sudo touch /etc/systemd/system`, and add the following contents using your preferred text editor.
- make sure to replace /path/to/ with the actual path to the pi-neopixel-v2 directory.
```
[Unit]
Description=pi-neopixel-v2
After=network.target

[Service]
ExecStart=/usr/bin/sudo /usr/bin/node /path/to/pi-neopixel-v2/index.js
WorkingDirectory=/path/to/pi-neopixel-v2
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Configuration

#### For convenience, a config file is located at /setup/config.json. Here is an explanation of each option
- `server_port`(int): the port that the server should run on. The default is 3001, but it can be any unused port from 0 to 65535.
- `number_of_leds`(int): the number of pixels in your LED strip. If this is too small, there will be unused pixels.
- `gpio_data_pin`(int): the pin on the raspberry pi where the data connection to the strip is connected.
- `verbose_logging`(bool): if true, the console will output a message every time a request is recieved, containing the color(s), animation(if applicable), and affected LEDs.

