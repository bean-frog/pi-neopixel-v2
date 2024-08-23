# pi-neopixel v2 documentation

<details>
	<summary>Raspberry Pi setup</summary>
</details>

## Configuration

#### For convenience, a config file is located at /setup/config.json. Here is an explanation of each option
- `server_port`: the port that the server should run on. The default is 3001, but it can be any unused port from 0 to 65535.
- `number_of_leds`: the number of pixels in your LED strip. If this is too small, there will be unused pixels.
- `gpio_data_pin`: the pin on the raspberry pi where the data connection to the strip is connected.

