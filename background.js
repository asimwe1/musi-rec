require('env').config()

const apiKey = process.env.apiKey; // Your AudD API key
let countdown = 8;

function startCountdown() {
  const countdownInterval = setInterval(() => {
    countdown--;

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      fetchAndDisplayMusicName();
    } else {
      updateCountdown(countdown);
    }
  }, 1000);
}

function updateCountdown(countdownValue) {
  console.log(`Updating countdown: ${countdownValue}`);
  chrome.runtime.sendMessage({ type: "countdown-update", data: countdownValue });
}

async function fetchAndDisplayMusicName() {
  try {
    console.log("Attempting to fetch and display music name...");
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    processor.onaudioprocess = async (event) => {
      try {
        console.log("Processing audio...");
        const audioBuffer = event.inputBuffer.getChannelData(0);
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

        const response = await fetch(`https://api.audd.io/upload`, {
          method: 'POST',
          body: audioBlob,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'audio/wav'
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Handle recognized song data
        const songData = {
          title: data.title,
          artist: data.artist,
          playLink: data.external_metadata.spotify
        };

        console.log("Sending song data to popup...");
        chrome.runtime.sendMessage({ type: "song-recognized", data: songData });
      } catch (error) {
        console.error("API error:", error);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  } catch (error) {
    console.error("Media access error:", error);
  }
}

startCountdown();
