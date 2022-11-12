//ID for muse devices
const MUSE_SERVICE = 0xfe8d

//channel to send commands to muse
let controlChar;
const MUSE_CONTROL_ID = '273e0001-4c4d-454d-96be-f03bac821358';

//eeg sensors
const MUSE_LEFT_EAR_ID = '273e0003-4c4d-454d-96be-f03bac821358';
const MUSE_LEFT_FOREHEAD_ID = '273e0004-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_FOREHEAD_ID = '273e0005-4c4d-454d-96be-f03bac821358';
const MUSE_RIGHT_EAR_ID = '273e0006-4c4d-454d-96be-f03bac821358';

//battery
const MUSE_BATTERY_ID = '273e000b-4c4d-454d-96be-f03bac821358';

//other sensors
const MUSE_GYROSCOPE_ID = '273e0009-4c4d-454d-96be-f03bac821358';
const MUSE_ACCELEROMETER_ID = '273e000a-4c4d-454d-96be-f03bac821358';
const MUSE_PPG_ID = '273e0010-4c4d-454d-96be-f03bac821358';

function connectToMuse() {

    //connection options, use MUSE id to search for nearby muse devices
    let connectionOptions = { filters: [{ services: [MUSE_SERVICE] }] };

    //ask bluetooth to connect
    bluetooth.connect(connectionOptions, museConnected);
}

//connected listener
async function initMuseStreaming(characteristics) {

    console.log("Connected to Muse");
    let controlActive = false;

    //go through each characteristic and add listeners
    for (let i = 0; i < characteristics.length; i++) {

        //get characteristic
        let characteristic = characteristics[i];

        //search by UUID 
        switch (characteristic.uuid) {

            case MUSE_CONTROL_ID:

                //control is how to send message to the Muse, like 'start' and 'stop'
                controlChar = characteristic;
                controlActive = true; //ok to proceed with streaming
                break;

            //the EEG sensors
            case MUSE_LEFT_EAR_ID:
                bluetooth.startNotifications(characteristic, didReceiveEegLeftEar);
                break;

            case MUSE_LEFT_FOREHEAD_ID:
                bluetooth.startNotifications(characteristic, didReceiveEegLeftForehead);
                break;

            case MUSE_RIGHT_EAR_ID:
                bluetooth.startNotifications(characteristic, didReceiveEegRightEar);
                break;

            case MUSE_RIGHT_FOREHEAD_ID:
                bluetooth.startNotifications(characteristic, didReceiveEegRightForehead);
                break;

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
    return controlActive;
}

async function startMuse() {

    //to stream data, send this sequence to headset
    //halt (a pause command)
    //connection type (PPG or no PPG)
    //start command
    //resume command
    //this sequence, in a row, starts the headset's streaming data

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