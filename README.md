# Muse-P5-OSC
A modified version of [jasonjsnell](https://github.com/jasonjsnell)'s [Muse-p5](https://github.com/jasonjsnell/Muse-P5) that includes OSC communication for use with [Max](https://cycling74.com/products/max). This repo also includes OSC bridge software based on [p5js-osc](https://github.com/genekogan/p5js-osc), built as Windows, Mac and Linux executables. These applications allow your browser to send OSC to Max via a local server.

## Getting started
 1. Launch the OSC bridge app that corresponds with your operating system (in the **osc bridge** folder). If you prefer, you can download the [p5js-osc](https://github.com/genekogan/p5js-osc) source and run it using Node.js.
 2. Launch the Muse-p5 sketch (**index.html**).
 3. Connect to your Muse headset using the Connect button.
 4. Open **muse_osc.maxpat** to receive Muse EEG band data in Max.

## Using two headsets at once
I've included a rudimentary setup for getting two headsets to output OSC data at once (**twoheadsets.html**). This essentially opens two instances of the Muse-p5 sketch in a single browser window. The 2nd one sends OSC values with modified addresses ("/delta2" instead of "/delta", "/alpha2" instead of "/alpha", etc.) Values from two headsets can be displayed using **muse_osc_2headsets.maxpat**.

## Troubleshooting
The web browser can be finicky in terms of persistently transmitting OSC data. I notice (on a Mac) that if my Max window is entirely covering both windows, they “lose focus” and don’t send any OSC data. Keeping the windows slightly visible fixes this for me.

I have tested this setup on Mac OS 13 on an M2 system using Google Chrome.
