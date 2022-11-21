function setup() {

  createCanvas(400, 400);

  setupMuse();

}

function draw() {

  background(200);

  textSize(10);
  text('BATTERY: ' + batteryLevel, width-80, 10);
  
  textSize(12);
  text('DELTA: ' + eeg.delta, 10, 30);
  text('THETA: ' + eeg.theta, 10, 45);
  text('ALPHA: ' + eeg.alpha, 10, 60);
  text('BETA:  ' + eeg.beta,  10, 75);
  text('GAMMA: ' + eeg.gamma, 10, 90);

  if (ppg.heartbeat) {
    text('HEART bpm: ' + ppg.bpm + ' •', 10, 120);
  } else {
    text('HEART bpm: ' + ppg.bpm, 10, 120);
  }

 
  
  text('ACCEL X: ' + accel.x, 10, 150);
  text('ACCEL Y: ' + accel.y, 10, 165);
  text('ACCEL Z: ' + accel.z, 10, 180);

  text('GYRO X: ' + gyro.x, 10, 210);
  text('GYRO Y: ' + gyro.y, 10, 225);
  text('GYRO Z: ' + gyro.z, 10, 240);

}

//Muse variables which P5 can access
let batteryLevel = 0;
let gyro = {
  x: 0,
  y: 0,
  z: 0
}
let accel = {
  x: 0,
  y: 0,
  z: 0
}

let ppg = {
  bpm: 0,
  heartbeat:false,
  amplitude: 0,
  buffer: []
}

let eeg = {
  delta: 0,
  theta: 0,
  alpha: 0,
  beta: 0,
  gamma: 0,
  sensors: []
}