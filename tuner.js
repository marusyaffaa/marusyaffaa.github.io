const pitch = new PitchAnalyzer(440); // A4
const noteNames = [
	'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

let started = false;

let act_button = document.querySelector("#mic_access")
let pitch_text = document.querySelector("#pitch")
let note_text = document.querySelector("#note")

act_button.addEventListener("click", (e) => {
	e.preventDefault()
	started = !started
	if (started) {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		navigator.mediaDevices.getUserMedia({ audio: true })
		  .then(function(stream) {
			  const source = audioContext.createMediaStreamSource(stream);
			  // Connect the source to further processing nodes
			  const bufferSize = 4096; // Adjust buffer size as needed
			  const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
			  source.connect(scriptProcessor);
			  scriptProcessor.connect(audioContext.destination);
			  scriptProcessor.onaudioprocess = async function(event) {
				  const audioBuffer = event.inputBuffer.getChannelData(0);
				  pitch.input(audioBuffer);
				  pitch.process();
				  let tone = pitch.findTone();

				  if (tone === null) {
					  pitch_text.innerText = "No tone found!"
				  } else {
					  console.log('Found a tone, frequency:', tone.freq);//Преобразование Фурье
					  const note = Math.round(12 * Math.log2(tone.freq / 440) + 69);// 12 нот в октаве
					  const noteFrequency = 440 * Math.pow(2, (note - 69) / 12); 
					  const cents = 1200 * Math.log2(tone.freq / noteFrequency);//в полутоне 100 центов
					  console.log("freq", noteFrequency)
					  console.log("cents", cents)
					  const note_id = note % 12
					  const musicalNote = noteNames[note_id];
					  pitch_text.innerText = tone.freq.toFixed(2) + "Hz"
					  note_text.innerText = musicalNote
					  note_text.style.transform = `translateX(${cents}px)`
				  }
			  };
		  })
		  .catch(function(error) {
			  console.error('Error accessing microphone:', error);
		  });
	}
})

const delay = ms => new Promise(res => setTimeout(res, ms));
