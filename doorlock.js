#!/usr/bin/env node
//Team 11 WSU

var unlockedState = 1000;
var lockedState = 2200;

var motorPin = 14;
var buttonPin = 4
var ledPin = 17
var pressurePin = 27

var blynkToken = '548cb79601b44097843b3d4fc5be504b';

// *** Start code *** //

var locked = true

//Setup servo
var Gpio = require('pigpio').Gpio,
  motor = new Gpio(motorPin, {mode: Gpio.OUTPUT}),
  button = new Gpio(buttonPin, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.FALLING_EDGE
  }),
  pressure = new Gpio(pressurePin, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.FALLING_EDGE
  }),
  led = new Gpio(ledPin, {mode: Gpio.OUTPUT});

//Setup blynk
var Blynk = require('blynk-library');
var blynk = new Blynk.Blynk(blynkToken);
//var blynk = new Blynk.Blynk(blynkToken,
// options= { addr:"127.0.0.1", port:443 }
//);


var v0 = new blynk.VirtualPin(0);


console.log("locking door")
lockDoor()

button.on('interrupt', function (level) {
	console.log("level: " + level + " locked: " + locked)
	if (level == 1) {
		if (locked) {
			unlockDoor()
		} else {
			lockDoor()
		}
	}
});

pressure.on('interrupt', function (level) {
	if (level != -1) {
		blynk.notify("Someone is at the door!");
	}
});

v0.on('write', function(param) {
	console.log('V0:', param);
  	if (param[0] === '0') { //unlocked
  		unlockDoor()
  	} else if (param[0] === '1') { //locked
  		lockDoor()
  	} else {
  		blynk.notify("Door lock button was pressed with unknown parameter");
  	}
});

blynk.on('connect', function() { console.log("Blynk ready."); });
blynk.on('disconnect', function() { console.log("DISCONNECT"); });

function lockDoor() {
	motor.servoWrite(lockedState);
	led.digitalWrite(1);
	locked = true

	//notify
  	blynk.notify("Door has been locked!");

  	//After 1.5 seconds, the door lock servo turns off to avoid stall current
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}

function unlockDoor() {
	motor.servoWrite(unlockedState);
	led.digitalWrite(0);
	locked = false

	//notify
  	blynk.notify("Door has been unlocked!");

  	//After 1.5 seconds, the door lock servo turns off to avoid stall current
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}

