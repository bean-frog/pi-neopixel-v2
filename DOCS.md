# pi-neopixel v2 documentation
## Raspberry Pi setup
- Install Raspbian (Raspberry Pi OS) using the instructions on the RaspberryPi website 
- Clone this repository (`gh repo clone bean-frog/pi-neopixel-2`), or download and unzip with the green button at the top of the repo 
- From /pi-neopixel-2, run `sudo node index.js`. `sudo` is required for the program to access the GPIO pins 
- (optional) to make the program run every time the Pi is powered on, create a file in `/etc/systemd/system` called `neopixel.service`, with the following contents:
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

