let bluetooth;
let usePPG = true;
let connectButton 

function setup() {

  createCanvas(200, 200);

  //this handles the bluetooth connection between the Muse and the computer
  bluetooth = new p5BLE();

  //create the connect button 
  connectButton = createButton('Connect')
  connectButton.mousePressed(connectButtonClicked);

}

//user clicks connect button
function connectButtonClicked() {
  connectToMuse();
}

//when muse connects, this function fires
function museConnected(error, characteristics) {
  if (error) {
    console.log(error); //error connecting
  } else {

    //hide the connect button
    connectButton.hide();

    //prepare muse to stream data
    let museIsReady = initMuseStreaming(characteristics);
    
    //if muse is ready for streaming
    if (museIsReady) {

      //then add a stream button to the page
      const startButton = createButton('Start');
      startButton.mousePressed(startButtonClicked);

      function startButtonClicked() {
        startButton.hide();
        startMuse();
      }
    }
  }
}



function draw() {
  background(125);

}



//parsing methods
//https://github.com/urish/muse-js/blob/4e864578c55dd7e26d85b429863f47ccabac54a0/src/lib/muse-parse.ts
//streaming listeners   
function didReceiveEegLeftEar(data) {

  console.log('L ear data:', data);

}

function didReceiveEegLeftForehead(data) {
  //console.log('L forehead data: ', data);
}

function didReceiveEegRightEar(data) {
  //console.log('R ear data: ', data);
}

function didReceiveEegRightForehead(data) {
  //console.log('R forehead data: ', data);
}

function didReceivePpg(data) {
  //process ppg buffer into samples and save
  ppg.samples = decodeUnsigned24BitData(new Uint8Array(data.buffer).subarray(2));
  console.log(ppg);
}

function didReceiveAccel(data) {
  let _samples = parseImuReading(data, 0.0000610352).samples;
  accel.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
  accel.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
  accel.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
  //console.log("Accel:", accel);
}

function didReceiveGyro(data) {
  let _samples = parseImuReading(data, 0.0074768).samples;
  gyro.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
  gyro.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
  gyro.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
  //console.log("Gyro:", gyro);
}

function didReceiveBattery(data) {
  batteryLevel = data.getUint16(2) / 512,
    console.log("Battery level:", batteryLevel, "%");
}


//vars which P5 can access
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
  samples: []
}