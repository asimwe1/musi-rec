// Receive song data and countdown value from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "song-recognized") {
      const { title, artist, playLink } = message.data;
      document.getElementById("countdown").style.display = "none"; // Hide countdown
      document.getElementById("song-info").style.display = "block"; // Show song info
  
      document.getElementById("song-title").textContent = title;
      document.getElementById("song-artist").textContent = artist;
      document.getElementById("play-link").href = playLink;
    } else if (message.type === "countdown-update") {
      const countdownValue = message.data;
      document.getElementById("countdown").textContent = `Fetching in ${countdownValue}s...`;
    }
  });
  