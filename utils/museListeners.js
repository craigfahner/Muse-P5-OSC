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

let ppgBuffer = new MuseBuffer(64);

function didReceivePpg(data) {

    //process data buffer into samples and save
    let ppgSamples = decodeUnsigned24BitData(new Uint8Array(data.buffer).subarray(2));
    
    //add decoded samples to the buffer
    ppg.buffer = ppgBuffer.update(ppgSamples);

    //calc the high and low values of the buffer
    let ppgMin = Math.min(...ppg.buffer);
    let ppgMax = Math.max(...ppg.buffer);

    //grab most recent value in ppg array
    ppg.amplitude = ppg.buffer[ppg.buffer.length-1];

    //what percentage is it of the max?
    let ppgPercent = ppgLast / ppgMax;

    //if recent value is near the max value, it's a heartbeat
    if (ppgPercent > 0.998) { //threshold for a beat detection
        //when heart beat is occurring
        ppg.heartbeat = true;
      } else {
        //else off
        ppg.heartbeat = false;
      }

    
    

}

function didReceiveAccel(data) {

    //parse the samples with multiplier
    let _samples = parseImuReading(data, 0.0000610352).samples;

    //average out the samples
    accel.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    accel.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    accel.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
    //console.log("Accel:", accel);
}

function didReceiveGyro(data) {

    //parse the samples with multiplier
    let _samples = parseImuReading(data, 0.0074768).samples;

    //average out the samples
    gyro.x = (_samples[0].x + _samples[1].x + _samples[2].x) / 3;
    gyro.y = (_samples[0].y + _samples[1].y + _samples[2].y) / 3;
    gyro.z = (_samples[0].z + _samples[1].z + _samples[2].z) / 3;
    //console.log("Gyro:", gyro);
}

function didReceiveBattery(data) {
    batteryLevel = data.getUint16(2) / 512,
    console.log("Battery level:", batteryLevel, "%");
}
