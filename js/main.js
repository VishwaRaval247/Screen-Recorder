let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [],
	recorder = null
startButton = null,
	stopButton = null,
	downloadButton = null,
	recordedVideo = null;

async function setupStream() {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
		});

		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			},
		});

		setupVideoFeedback();
	} catch (err) {
		console.error(err)
	}
}

function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('.video-feedback');
		video.srcObject = stream;
		video.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording() {

	await setupStream();

	if (stream && audio) {
			mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
			recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);

		startButton.disabled = true;
		stopButton.disabled = false;

		console.log('Recording started');
	} else {
		console.warn('No stream available.');
	}
}

function stopRecording() {
	recorder.stop();

	startButton.disabled = false;
	stopButton.disabled = true;
}

function handleDataAvailable(e) {
	chunks.push(e.data);
}

function handleStop(e) {
	const blob = new Blob(chunks, { 'type': 'video/mp4' });
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'video.mp4';
	downloadButton.disabled = false;

	recordedVideo.src = URL.createObjectURL(blob);
	recordedVideo.load();
	recordedVideo.onloadeddata = function () {
		const rc = document.querySelector(".recorded-video-wrap");
		rc.classList.remove("hidden");
		rc.scrollIntoView({ behavior: "smooth", block: "start" });

		recordedVideo.play();
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');
}

window.addEventListener('load', () => {
	startButton = document.querySelector('.start-recording');
	stopButton = document.querySelector('.stop-recording');
	downloadButton = document.querySelector('.download-video');
	recordedVideo = document.querySelector('.recorded-video');

	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})


// Screenshot js

const captureButton = document.getElementById('capture-button');
const screenshotCanvas = document.getElementById('screenshot-canvas');
const downloadCanvasButton = document.getElementById('download-button');
const showCanvas = document.getElementById('show')
const ctx = screenshotCanvas.getContext('2d');

// When the user clicks the capture button, start the screen capture process
captureButton.addEventListener('click', async () => {
	// Use the getDisplayMedia() method to request access to the user's screen
	const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

	// Create a new video element and set its srcObject to the screen capture stream
	const videoElement = document.createElement('video');
	videoElement.srcObject = stream;
	videoElement.play();

	// Wait for the video to load and then capture a screenshot
	videoElement.addEventListener('loadeddata', () => {
		// Set the canvas size to match the video dimensions
		screenshotCanvas.width = videoElement.videoWidth;
		screenshotCanvas.height = videoElement.videoHeight;

		// Draw the video frame onto the canvas
		ctx.drawImage(videoElement, 0, 0, screenshotCanvas.width, screenshotCanvas.height);

		// Create an image element and set its src to the canvas data URL
		const img = new Image();
		img.src = screenshotCanvas.toDataURL('image/png');

		// Replace the contents of the screenshot container with the image element
		const screenshotContainer = document.getElementById('screenshot-container');
		screenshotContainer.innerHTML = '';
		screenshotContainer.appendChild(img);
		screenshotContainer.style.display = 'block';
		showCanvas.style.display = 'none';


		// Show the download button
		downloadCanvasButton.style.display = 'block';

		// Stop the screen capture stream
		stream.getTracks().forEach(track => track.stop());
	});
});

// When the user clicks the download button, download the screenshot
downloadButton.addEventListener('click', () => {
	// Get the data URL of the screenshot from the canvas
	const dataUrl = screenshotCanvas.toDataURL('image/png');

	// Create a temporary link element to download the screenshot
	const link = document.createElement('a');
	link.download = 'screenshot.png';
	link.href = dataUrl;

	// Click the link to trigger the download
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
});


