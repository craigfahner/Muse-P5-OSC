let socket;
let isConnected;

function setup() {

  createCanvas(400, 400);

  setupMuse();
  setupOsc(8000, 12000);
}

function draw() {

  background(200);

  // EEG chart
  beginShape();
  strokeWeight(1);
  noFill();
  stroke(255, 255, 255);

  for (let i = 1; i <= (eegSpectrum.length/2); i++) {
   let x = map(i, 0, eegSpectrum.length/2, 0, width);
   let y = map(eegSpectrum[i], 0, 50, height, 0);
   vertex(x, y); //<-- draw a line graph
  }
  endShape();

  noStroke();
  fill(0,0,0);
  textSize(10);
  text('BATTERY: ' + Math.floor(batteryLevel), width-80, 10);
  sendOsc('/battery', Math.floor(batteryLevel));
  
  textSize(12);
  text('DELTA: ' + eeg.delta.toFixed(0), 10, 30);
  sendOsc('/delta', int(eeg.delta.toFixed(0), 10, 30));
  text('THETA: ' + eeg.theta.toFixed(0), 10, 45);
  sendOsc('/theta', int(eeg.theta.toFixed(0), 10, 45));
  text('ALPHA: ' + eeg.alpha.toFixed(0), 10, 60);
  sendOsc('/alpha', int(eeg.alpha.toFixed(0), 10, 60));
  text('BETA:  ' + eeg.beta.toFixed(0),  10, 75);
  sendOsc('/beta', int(eeg.beta.toFixed(0),  10, 75));
  text('GAMMA: ' + eeg.gamma.toFixed(0), 10, 90);
  sendOsc('/gamma', int(eeg.gamma.toFixed(0), 10, 90));

  if (ppg.heartbeat) {
    text('HEART bpm: ' + ppg.bpm + ' •', 10, 120);
    sendOsc('/heartbeat', 1);
  } else {
    sendOsc('/heartbeat', 0);
    text('HEART bpm: ' + ppg.bpm, 10, 120);
  }

  sendOsc('/heartbpm', int(ppg.bpm));

 
  
  text('ACCEL X: ' + accel.x.toFixed(2), 10, 150);
  sendOsc('/accel_x', float(accel.x.toFixed(2)));
  text('ACCEL Y: ' + accel.y.toFixed(2), 10, 165);
  sendOsc('/accel_y', float(accel.y.toFixed(2)));
  text('ACCEL Z: ' + accel.z.toFixed(2), 10, 180);
  sendOsc('/accel_z', float(accel.z.toFixed(2)));

  text('GYRO X: ' + gyro.x.toFixed(2), 10, 210);
  sendOsc('/gyro_x', float(gyro.x.toFixed(2)));
  text('GYRO Y: ' + gyro.y.toFixed(2), 10, 225);
  sendOsc('/gyro_y', float(gyro.y.toFixed(2)));
  text('GYRO Z: ' + gyro.z.toFixed(2), 10, 240);
  sendOsc('/gyro_z', float(gyro.z.toFixed(2)));

}

function receiveOsc(address, value) {
	console.log("received OSC: " + address + ", " + value);
}

function sendOsc(address, value) {
	if (isConnected) {
		socket.emit('message', [address, value]);
	}
}

function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});

	socket.on('connect', function() {
		isConnected = true;
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}

function mousePressed(){
  console.log(isConnected);
  sendOsc('/connection', 1);
}