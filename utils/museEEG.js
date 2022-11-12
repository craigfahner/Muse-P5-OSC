       
function processEEG(sensor, data) {

    console.log("eeg sensor num", sensor);

    //process data buffer into samples and save
    let eegSamples = decodeUnsigned12BitData(new Uint8Array(data.buffer).subarray(2));

    //pass into the specified sensor
    sensors[sensor].update(eegSamples);

    //average the spectrums from all the sensors (for display)
    let sensorSpectrums = []
    for (let i = 0; i < this.sensors.length; i++) {
        sensorSpectrums.push(this.sensors[i].spectrum);
    }
    //store in class var
    this.spectrum = _getAverageByIndex(sensorSpectrums);

    //calculate brainwave averages
    let deltaTotal = 0;
    let thetaTotal = 0;
    let alphaTotal = 0;
    let betaTotal = 0;
    let gammaTotal = 0;
    
    for (let i = 0; i < this.sensors.length; i++) {
        let sensor = this.sensors[i];
        deltaTotal += sensor.delta.average;
        thetaTotal += sensor.theta.average;
        alphaTotal += sensor.alpha.average;
        betaTotal += sensor.beta.average;
        gammaTotal += sensor.gamma.average;
    }

    eeg.delta = deltaTotal / this.sensors.length;
    eeg.theta = thetaTotal / this.sensors.length;
    eeg.alpha = alphaTotal / this.sensors.length;
    eeg.beta = betaTotal / this.sensors.length;
    eeg.gamma = gammaTotal / this.sensors.length;

}

class EEGSensor {

    constructor() {

        //data buffer
        this.EEG_BUFFER_SIZE = 256;
        this.buffer = new MuseBuffer(this.EEG_BUFFER_SIZE);

        //fft to process time based samples in buffer into a frequency based spectrum
        let MUSE_SAMPLE_RATE = 220;
        this.fft = new FFT(this.EEG_BUFFER_SIZE, MUSE_SAMPLE_RATE);

        //divide the sample rate by the buffer size to get how many frequencies are covered per fft bin
        let freqInc = (MUSE_SAMPLE_RATE / this.EEG_BUFFER_SIZE)

        //create and store an array to store what frequency is at what bin
        //only is the sample rate and the buffer size were exactly the same
        //(like 256 sample rate / 256 buffer size)
        //would each bin be 1 Hz
        //since they aren't, we need to calculate which bin corresponds with which Hz
        
        //start with an array of 0's
        this.frequencies = new Array(this.EEG_BUFFER_SIZE/2).fill(0);
        //loop through
        for (let i = 0; i < this.frequencies.length; i++) {
            //each slot is the slot num x the incrementation
            //for example, if the sample rate is 220 and buffer is 246  
            //then the frequencies in the bins are:
            //0, 0.859375, 1.71875, 2.578125, 3.4375, etc...
            //not 0, 1, 2, 3, 4, etc...
            this.frequencies[i] = i * freqInc; 
        }

        //calc the high and low bin for each brainwave
        //pass in the Hz (like alpha is 8-12)
        //get back the bins (alpha bins are 9-14)

        let deltaLow = this._getPositionForFrequency(1, this.frequencies);
        let deltaHigh = this._getPositionForFrequency(3, this.frequencies);
        this.delta = new EEGWave(deltaLow, deltaHigh);
        let thetaLow = this._getPositionForFrequency(4, this.frequencies);
        let thetaHigh = this._getPositionForFrequency(7, this.frequencies);
        this.theta = new EEGWave(thetaLow, thetaHigh);
        let alphaLow = this._getPositionForFrequency(8, this.frequencies);
        let alphaHigh = this._getPositionForFrequency(12, this.frequencies);
        this.alpha = new EEGWave(alphaLow, alphaHigh);
        let betaLow = this._getPositionForFrequency(13, this.frequencies);
        let betaHigh = this._getPositionForFrequency(30, this.frequencies);
        this.beta = new EEGWave(betaLow, betaHigh);
        let gammaLow = this._getPositionForFrequency(31, this.frequencies);
        let gammaHigh = this._getPositionForFrequency(50, this.frequencies);
        this.gamma = new EEGWave(gammaLow, gammaHigh);
        
        //store all the new waves in an array for access
        this.waves = [
            this.delta,
            this.theta,
            this.alpha,
            this.beta,
            this.gamma,
        ]

        //and store the whole spectrum var for screen printing, etc...
        this.spectrum = new Array(this.EEG_BUFFER_SIZE/2).fill(0);
    }

    update(withSamples) {

        let bufferData = this.buffer.update(withSamples)
        this.spectrum = this.fft.forward(bufferData);
       
        for (let i = 0; i < this.waves.length; i++) {
            let wave = this.waves[i];
            wave.update(this.spectrum.slice(wave.binLow, wave.binHigh));
        }
    }
  
    //helpers
    _findClosestValue(searchValue, inArray) {

        return inArray.reduce((a, b) => {
            let aDiff = Math.abs(a - searchValue);
            let bDiff = Math.abs(b - searchValue);
    
            if (aDiff == bDiff) {
                return a > b ? a : b;
            } else {
                return bDiff < aDiff ? b : a;
            }
        });
    }

    _getPositionForFrequency(frequency, inArray){
        let exactFrequency = this._findClosestValue(frequency, inArray)
        let exactFrequencyPosition = inArray.indexOf(exactFrequency, 0);
         return exactFrequencyPosition;
    }

}

class EEGWave {

    constructor(binLow, binHigh) {
        this.binLow = binLow;
        this.binHigh = binHigh
        this.spectrum = []
        this.average = 0;
    }

    update(withSpectrum) {

        this.spectrum = withSpectrum;
        this.average = withSpectrum.reduce((a, b) => a + b) / withSpectrum.length;

    }
}

//helper
function _getAverageByIndex(arrays) {

    //create blank array to store the averages
    let avgArr = new Array(arrays[0].length).fill(0);
    
    //step through each empty slot in averaged array
    for (let s = 0; s < avgArr.length; s++) {

        //loop throgh the values in this position
        let positionAvg = 0;
        for (let a = 0; a < arrays.length; a++) {
            positionAvg += arrays[a][s]; //add them up
        }
        //divide to get average
        positionAvg /= arrays.length;

        //store in slot
        avgArr[s] = positionAvg;
    }

    return avgArr;
}


//vars (need to be after the class definitions)

let leftEar = new EEGSensor();
let leftForehead = new EEGSensor();
let rightForehead = new EEGSensor();
let rightEar = new EEGSensor();

let sensors = [
    leftEar,
    leftForehead,
    rightForehead,
    rightEar
]

let spectrum = new Array(leftEar.EEG_BUFFER_SIZE/2).fill(0);
 