/**
 * AudioRecorder
 * Created: August 20, 2020
 * Author: Eamonn Alphin
 * Handles the code related to Problem 2:
 * [JavaScript]​ You are tasked to implement a real-time audio processing module within a web browser.
 * You need to record audio from the microphone and visualize the loudness of the audio signal within a webpage.
 * The implementation needs to support the latest releases of Chrome, Safari, and Firefox.
 *
 * Resources:
 * https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
 * https://developers.google.com/web/updates/2016/01/mediarecorder
 * https://developers.google.com/web/fundamentals/media/recording-audio
 */


/**
 * Create global accessible variables that will be modified later
 * Author: Carlos Delgado / Eamonn Alphin
 */
var audioContext = null; //the audio context
var meter = null; //the visualization of the loudness
var rafID = null; //the required animation frame id, for updating the visualization.
var mediaStreamSource = null; //for passing the audio to the recorder
var canvasContext = null; //the canvas to display the visualizer
var WIDTH = 500 //the starting width of the visualizer
var HEIGHT = 50 //the starting height of the visualizer
var mediaRecorder = null; //the media recorder, to record the audio
var recordedChunks = []; //to hold the recorded data
var downloadLink = "" //will contain the link to download the recording
var recordingTimer = 0; //displays the recording length, in seconds.
var recording = false; //true if actually recording, false if not.


/**
 * Handle the User clicking the Start Button, starts recording and displaying loudness.
 * Author: Eamonn Alphin
 */
function start() {
  // Check if the site/browser can access the microphone
  try {
    navigator.mediaDevices.getUserMedia({audio: true, video: false})
      .then(onMicrophoneGranted)
      .catch(function(error){
        console.log("error:", error)
        alert("Error Accessing microphone, please ensure your browser has permission to use the microphone: "+ error)
      })
  }  catch (e) {
    alert('There was an error starting the recorder:' + e);
  }
}


/**
 * Callback if access to the microphone is granted
 * Author: Carlos Delgado, Source: https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
 * Modified August 20, 2020: Eamonn Alphin
 */
function onMicrophoneGranted(stream) {
  //Eamonn Alphin: Visual elements

  if(!recording) {
    recording = true
    displayRecordingTime()
    document.getElementById("volume").hidden = false
    document.getElementById("meter").hidden = false
    document.getElementById("startRecordingBtn").hidden = true
    document.getElementById("stopRecordingBtn").hidden = false
    document.getElementById("downloadBtn").hidden = true

    //Eamonn Alphin: Set the download link for the file, when it becomes available
    downloadLink = document.getElementById('downloadLink');

    // Retrieve AudioContext with all the prefixes of the browsers
    // Safari doesn't support AudioContext so you need to include webkitAudioContext
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    // Carlos Delgado: Get the canvas that will be used to display the audio meter.
    canvasContext = document.getElementById("meter").getContext("2d");

    // Carlos Delgado: Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Carlos Delgado: Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);


    //Eamonn Alphin: MediaRecorder works in Chrome, but was added to Safari in January 2019
    //To enable it in Safari, you have to go to Develop > Experimental Features > Media Recorder.
    //I realise you probably wont accept this though, since it has to work with the
    //current version of safari.
    //Support: https://blog.addpipe.com/safari-technology-preview-73-adds-limited-mediastream-recorder-api-support/

    //There is a way to record audio, but it uses a third party package: https://github.com/ai/audio-recorder-polyfill

    try {
      mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});


      //Eamonn Alphin: Handles what happens when data is available (after the stream is stopped)
      let recordData = function (e) {
        console.log("got data:", e.data)
        recordedChunks.push(e.data);

        let blob = new Blob(recordedChunks);
        console.log(blob)
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = 'recording.wav';
        document.getElementById("downloadBtn").hidden = false
      }

      //Eamonn Alphin : this gets called when the stream is stopped, so create the file and download link in this function.
      mediaRecorder.ondataavailable = recordData
      mediaRecorder.start();

      // Carlos Delgado: Trigger callback that shows the level of the "Volume Meter"
      onLevelChange();


    }catch(e){

      //Safari is the only browser that doesn't support MediaRecorder without any input from the user.
      let isSafari = window.safari !== undefined;
      if(isSafari){
        alert("If you are using Safari, you will need to enable Media Recorder in the Develop Menu and refresh the page." + e)
      }else{
        alert("Something went wrong and the recorder could not be started: "+ e)
      }


      stopRecordingTime()
      recording = false
      document.getElementById("volume").hidden = true
      document.getElementById("meter").hidden = true
      document.getElementById("startRecordingBtn").hidden = false
      document.getElementById("stopRecordingBtn").hidden = true
    }


  }else{
    console.log("Already recording")
  }

}




/**
 * Handles the user clicking the stop button; stops the recording.
 * Author: Eamonn Alphin
 */
function stop(){
  if(recording) {
    recording = false
    mediaRecorder.stop();
    stopRecordingTime()
    document.getElementById("volume").hidden = true
    document.getElementById("meter").hidden = true
    document.getElementById("startRecordingBtn").hidden = false
    document.getElementById("stopRecordingBtn").hidden = true

  }else{
    console.log("recording is stopped.")
  }
}





/**
 * This function is executed repeatedly
 * Author: Carlos Delgado, Source: https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
 */
function onLevelChange() {
  // clear the background
  canvasContext.clearRect(0,0,WIDTH,HEIGHT);

  // check if we're currently clipping
  if (meter.checkClipping())
    canvasContext.fillStyle = "red";
  else
    canvasContext.fillStyle = "green";

  //console.log(meter.volume);

  // draw a bar based on the current volume
  canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

  // set up the next visual callback
  rafID = window.requestAnimationFrame( onLevelChange );
  document.getElementById("volume").innerText = meter.volume


}

/**
 * Handles displaying the length of the recording
 * Author: Eamonn Alphin
 */
function displayRecordingTime(){
  let timeInterval = 0;

  recordingTimer = window.setInterval(()=>{
    timeInterval++
    document.getElementById("time").innerText = secondsToDisplayString(timeInterval)
  }, 1000);
}

/**
 * Handles stopping the time recorder.
 * Author: Eamonn Alphin
 */
function stopRecordingTime(){
  window.clearInterval(recordingTimer)
}

/**
 * convert the number of seconds of the recording to a hh:mm:ss format.
 * Author: Eamonn Alphin
 * @param seconds
 * @returns {string}
 */
function secondsToDisplayString(seconds){
  let hours = Math.floor(seconds/3600)
  let minutes = Math.floor((seconds%3600)/60)
  seconds = Math.floor(seconds % 60)
  return twoDigitString(hours) + " : " + twoDigitString(minutes) + " : " + twoDigitString(seconds);
}

/**
 * Format the number as a string of two digits
 * Author: Rahim via Stack Overflow
 * Source: https://stackoverflow.com/questions/6118922/convert-seconds-value-to-hours-minutes-seconds
 * @param number
 * @returns {string|*}
 */
function twoDigitString(number) {

  if (number === 0) {
    return "00";
  }

  if (Math.floor(number / 10) === 0) {
    return "0" + number;
  }

  return number
}
