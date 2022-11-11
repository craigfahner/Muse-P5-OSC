let p5Bluetooth;
let usePPG = true;


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

              const streamButton = createButton('Stream')
              streamButton.mousePressed(streamButtonClick);
              break;

            case MUSE_LEFT_EAR_ID:
              p5Bluetooth.startNotifications(characteristic, eegLeftEar); 
              break;

            case MUSE_LEFT_FOREHEAD_ID:
              p5Bluetooth.startNotifications(characteristic, eegLeftForehead); 
              break;

              case MUSE_RIGHT_EAR_ID:
                p5Bluetooth.startNotifications(characteristic, eegRightEar); 
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
         
          await controlChar.writeValue(encodeCommand('h')); //pause
          
          if (usePPG) {

            //use ppg, Muse 2
            await controlChar.writeValue(encodeCommand('p50')); 
          
          } else {

            //no ppg, Muse 1
            await controlChar.writeValue(encodeCommand('p21'));
          }
          
          await controlChar.writeValue(encodeCommand('s'));
          await controlChar.writeValue(encodeCommand('d'));

        }

      }
      


      function eegLeftEar(data) {
        console.log('L ear data: ', data);
      }

      function eegLeftForehead(data) {
        console.log('L forehead data: ', data);
      }

      function eegRightEar(data) {
        console.log('R ear data: ', data);
      }
      //console.log(characteristic.uuid);

  
    }
  }

function encodeCommand(cmd) {
    const encoded = new TextEncoder().encode(`X${cmd}\n`);
    encoded[0] = encoded.length - 1;
    return encoded;
}
  