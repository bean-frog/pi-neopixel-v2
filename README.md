# pi-neopixel-2
A major upgrade to bean-frog/pi-neopixel.

See DOCS.md for documentation and installation/use instructions.

## Explanation
This project provides a way to control Neopixel (or adjacent) individually addressable LEDs from a webpage over http. 
A simple web server is run on the Raspberry Pi, which serves a webpage at a user-configurable port (default is 3000). The webpage contains several controls for the LEDs, and manipulating these controls sends http requests back to the server. These requests contain the LED(s) that need to be changed, as well as an object containing red, green, and blue values. These values are parsed by the server, and are converted into a signal that the LEDs can understand, before being sent through the user-configurable GPIO pin that the LEDs are connected to.
<br>
Pi-Neopixel was a project I made for AP CSP, and it was thrown together pretty quickly, and thus it works but sometimes isnt very user friendly. <br>
This version is intended to improve upon my original design, and was created for Harvard's online course CS50x. <br>
Due to the fact that I'm using the same technologies and method, some of the code looks similar, though this project was written from scratch without cloning the old version, for the sake of my mental health(jk but the old version does kinda suck) <br>

## What's new?
- Custom network running on the Pi
- Set all functions no longer spam the set single function (why tf did i think that was a good idea :skull:)
- more robust UI
- config.json file for setup
- more prebuilt animated sequences
- more customization for animations
- animations are now non-blocking

## Technologies used
- HTML/Javascript
- NodeJS
- ExpressJS
- Tailwind CSS
- [piixel](https://github.com/bjoerge/piixel) library - WS281x Typescript bindings

## dev/contributing info
- Don't upgrade piixel in package.json - v1.1.1+ will start throwing a ton of errors
- If you can fix above note, you can ignore it.

