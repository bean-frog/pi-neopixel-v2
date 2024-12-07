# pi-neopixel v2 

## Hardware setup
- Connect the positive lead to one of the 5v pins on the Pi, and the negative to GND.
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


</details>

## Configuration

#### For convenience, a config file is located at /setup/config.json. Here is an explanation of each option
- `server_port`(int): the port that the server should run on. The default is 3001, but it can be any unused port from 0 to 65535.
- `number_of_leds`(int): the number of pixels in your LED strip. If this is too small, there will be unused pixels.
- `gpio_data_pin`(int): the pin on the raspberry pi where the data connection to the strip is connected.
- `verbose_logging`(bool): if true, the console will output a message every time a request is recieved, containing the color(s), animation(if applicable), and affected LEDs.

