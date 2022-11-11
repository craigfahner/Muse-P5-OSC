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
  const MUSE_CONTROL_ID= '273e0001-4c4d-454d-96be-f03bac821358';

  const MUSE_LEFT_EAR_ID = '273e0003-4c4d-454d-96be-f03bac821358';
  const MUSE_LEFT_FOREHEAD_ID = '273e0004-4c4d-454d-96be-f03bac821358';
  const MUSE_RIGHT_FOREHEAD_ID = '273e0005-4c4d-454d-96be-f03bac821358';
  const MUSE_RIGHT_EAR_ID = '273e0006-4c4d-454d-96be-f03bac821358';

  const MUSE_BATTERY_ID = '273e000b-4c4d-454d-96be-f03bac821358';
  const MUSE_GYROSCOPE_ID = '273e0009-4c4d-454d-96be-f03bac821358';
  const MUSE_ACCELEROMETER_ID = '273e000a-4c4d-454d-96be-f03bac821358';
  const MUSE_PPG_ID = '273e0010-4c4d-454d-96be-f03bac821358';

   //user clicks connect button
  function connectBtnClick(){

    //connection options, use MUSE id to search for nearby muse devices
    let connectionOptions = { filters: [{ services: [MUSE_SERVICE] }]};
    
    //ask bluetooth to connect
    bluetooth.connect(connectionOptions, connected);

    //connected 
    function connected(error, characteristics) {

      console.log("Connected to Muse");

      if (error) {

        console.log(error);

      }  else {

        //go through each characteristic and add listeners
        for (let i = 0; i < characteristics.length; i++) {
          
          //get characteristic
          let characteristic = characteristics[i];
    
          //search by UUID 
          switch(characteristic.uuid) {

            case MUSE_CONTROL_ID:

            //control is how to send message to the Muse, like 'start' and 'stop'
            controlChar = characteristic

            //when the control char is found, a stream button can be made
            const streamButton = createButton('Stream')
            streamButton.mousePressed(streamButtonClick);
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

        
      }

      

      async function streamButtonClick(){

        //stream data
  
        if (controlChar){
         
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
      

      //streaming listeners   
      function didReceiveEegLeftEar(data) {
        console.log('L ear data: ', data);
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
        //console.log('PPG data: ', data);
      }

      function didReceiveAccel(data) {
        console.log('Accel data: ', data);
      }

      function didReceiveGyro(data) {
        //console.log('Gyro data: ', data);
      }

      function didReceiveBattery(data) {
        //console.log('Battery data: ', data);
      }

  
    }
  }


  