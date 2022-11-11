let bluetooth;
let usePPG = true;


function setup() {

  createCanvas(200, 200);

  //this handles the bluetooth connection between the Muse and the computer
  bluetooth = new museBluetooth();

  //create the connect button 
  const connectButton = createButton('Connect')
  connectButton.mousePressed(connectBtnClick);

}

function draw() {
  background(250);

}

//BLUETOOTH CONNECTIONS

//ID for muse devices
const MUSE_SERVICE = 0xfe8d

//channel to send commands to muse
let controlChar;
const MUSE_CONTROL_ID = '273e0001-4c4d-454d-96be-f03bac821358';

const MUSE_LEFT_EAR_ID = '273e0003-4c4d-454d-96be-f03bac821358';
const MUSE_LEFT_FOREHEAD_ID = '273e0004-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_FOREHEAD_ID = '273e0005-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_EAR_ID = '273e0006-4c4d-454d-96be-f03bac821358';

const MUSE_BATTERY_ID = '273e000b-4c4d-454d-96be-f03bac821358';
const MUSE_GYROSCOPE_ID = '273e0009-4c4d-454d-96be-f03bac821358';
const MUSE_ACCELEROMETER_ID = '273e000a-4c4d-454d-96be-f03bac821358';
const MUSE_PPG_ID = '273e0010-4c4d-454d-96be-f03bac821358';

//user clicks connect button
function connectBtnClick() {

  //connection options, use MUSE id to search for nearby muse devices
  let connectionOptions = { filters: [{ services: [MUSE_SERVICE] }] };

  //ask bluetooth to connect
  bluetooth.connect(connectionOptions, connected);

  //connected 
  function connected(error, characteristics) {

    console.log("Connected to Muse");

    if (error) {

      console.log(error);

    } else {

      //go through each characteristic and add listeners
      for (let i = 0; i < characteristics.length; i++) {

        //get characteristic
        let characteristic = characteristics[i];

        //search by UUID 
        switch (characteristic.uuid) {

          case MUSE_CONTROL_ID:

            //control is how to send message to the Muse, like 'start' and 'stop'
            controlChar = characteristic

            //when the control char is found, a stream button can be made
            const streamButton = createButton('Stream')
            streamButton.mousePressed(streamButtonClick);
            break;

          //the EEG sensors
          // case MUSE_LEFT_EAR_ID:
          // bluetooth.startNotifications(characteristic, didReceiveEegLeftEar); 
          // break;

          // case MUSE_LEFT_FOREHEAD_ID:
          // bluetooth.startNotifications(characteristic, didReceiveEegLeftForehead); 
          // break;

          // case MUSE_RIGHT_EAR_ID:
          // bluetooth.startNotifications(characteristic, didReceiveEegRightEar); 
          // break;

          // case MUSE_RIGHT_FOREHEAD_ID:
          // bluetooth.startNotifications(characteristic, didReceiveEegRightForehead); 
          // break;

          case MUSE_PPG_ID:
            bluetooth.startNotifications(characteristic, didReceivePpg);
            break;

          case MUSE_ACCELEROMETER_ID:
            bluetooth.startNotifications(characteristic, didReceiveAccel);
            break;

          case MUSE_GYROSCOPE_ID:
            bluetooth.startNotifications(characteristic, didReceiveGyro);
            break;

          case MUSE_BATTERY_ID:
            bluetooth.startNotifications(characteristic, didReceiveBattery);
            break;

          default:
            //console.log("Unused characteristic:", characteristic)
            break;
        }
      }


    }



    async function streamButtonClick() {

      //stream data

      if (controlChar) {

        await bluetooth.sendCommand(controlChar, 'h'); //halt

        if (usePPG) {

          //use ppg, Muse 2
          await bluetooth.sendCommand(controlChar, 'p50');

        } else {

          //no ppg, Muse 1
          await bluetooth.sendCommand(controlChar, 'p21');
        }

        await bluetooth.sendCommand(controlChar, 's'); //start
        await bluetooth.sendCommand(controlChar, 'd'); //resume

      }

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

    //PARSING FUNCTIONS
    function decodeUnsigned24BitData(samples) {
      const samples24Bit = [];
      for (let i = 0; i < samples.length; i = i + 3) {
        samples24Bit.push((samples[i] << 16) | (samples[i + 1] << 8) | samples[i + 2]);
      }
      return samples24Bit;
    }
    //parses gyro and accel data
    function parseImuReading(data, scale) {
      function sample(startIndex) {
        return {
          x: scale * data.getInt16(startIndex),
          y: scale * data.getInt16(startIndex + 2),
          z: scale * data.getInt16(startIndex + 4),
        };
      }
      return {
        sequenceId: data.getUint16(0),
        samples: [sample(2), sample(8), sample(14)],
      };
    }


  }
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
  samples:[]
}