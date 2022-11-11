let p5Bluetooth;


function setup() {

    createCanvas(200, 200);

    p5Bluetooth = new p5BLE();
    // Connect to a BLE device by passing the service UUID
  
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
  const MUSE_FOREHEAD_ID = '273e0005-4c4d-454d-96be-f03bac821358';
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
    p5Bluetooth.connect(connectionOptions, discoveredCharacteristics);

    //retrieved 
    function discoveredCharacteristics(error, characteristics) {

      console.log("discoveredCharacteristics");

      if (error) {
        console.log(error);
      }  else {

        for (let i = 0; i < characteristics.length; i++) {
          console.log("char", i);
          let characteristic = characteristics[i];
    
          switch(characteristic.uuid) {
            case MUSE_CONTROL_ID:
              controlChar = characteristic

              console.log("create stream button")
              const streamButton = createButton('Stream')
              streamButton.mousePressed(streamButtonClick);
              break;

            case MUSE_LEFT_EAR_ID:
              p5Bluetooth.startNotifications(characteristic, eegLeftEar); 
              break;

            case MUSE_LEFT_FOREHEAD_ID:
              p5Bluetooth.startNotifications(characteristic, eegLeftForehead); 
              break;
            
            default:
              //console.log("Unused characteristic:", characteristic)
              break;
          }
       }

        
      }

      

      function streamButtonClick(){

        //stream data
  
        if (controlChar){
          console.log("try to send command via", controlChar)
          /*
          await this.sendCommand('h');
          //'p21'
          if (this.enablePpg) {
            preset = 'p50';
          await this.controlChar.writeValue(encodeCommand(preset));
        await this.controlChar.writeValue(encodeCommand('s'));
        await this.resume();
          */
         p5Bluetooth.writeTest(0, 1);

          //p5Bluetooth.write(controlChar, 'h');//[0x02, 0x64, 0x0a][0x02, 0x73, 0x0a]
        
        }

      }
      


      function eegLeftEar(data) {
        console.log('L ear data: ', data);
      }

      function eegLeftForehead(data) {
        console.log('L forehead data: ', data);
      }
      //console.log(characteristic.uuid);

  
    }
  }

  

  
  
  // // const serviceUuid = "19b10010-e8f2-537e-4f6c-d104768a1214";
  // // let myCharacteristic;
  // // let myValue = 0;
  // // let myBLE;
  
  // function setup() {
  //         // Create a p5ble class
  //         myBLE = new p5ble();
  
  //         createCanvas(200, 200);
  //         textSize(20);
  //         textAlign(CENTER, CENTER);
  
  //         // Create a 'Connect' button
  //         const connectButton = createButton('Connect')
  //         connectButton.mousePressed(connectToBle);
  //       }
  
  // function connectToBle() {
  //   // Connect to a device by passing the service UUID
  //   myBLE.connect(serviceUuid, gotCharacteristics);
  // }
  
  // // A function that will be called once got characteristics
  // function gotCharacteristics(error, characteristics) {
  //   if (error) console.log("error: ", error);
  //   console.log("characteristics: ", characteristics);
  //   myCharacteristic = characteristics[0];
  //   // Read the value of the first characteristic
  //   myBLE.read(myCharacteristic, gotValue);
  // }
  
  // // A function that will be called once got values
  // function gotValue(error, value) {
  //   if (error) console.log("error: ", error);
  //   console.log("value: ", value);
  //   myValue = value;
  //   // After getting a value, call p5ble.read() again to get the value again
  //   myBLE.read(myCharacteristic, gotValue);
  // }
  
  // function setup() {
  //   createCanvas(400, 400);
  // }
  
  // function draw() {
  //   background(250);
  //   text(myValue, 100, 100);
  // }
  