// Sound setup
const sounds = {
  piano: new Audio('/static/sounds/piano.mp3'),
  chimes: new Audio('/static/sounds/chimes.mp3'),
  forest: new Audio('static/sounds/forest.mp3'),
  waves: new Audio('/static/sounds/waves.mp3'),
  asmr: new Audio('/static/sounds/asmr.mp3'),
  rain: new Audio('/static/sounds/rain.mp3')
};

Object.values(sounds).forEach(sound => {
  sound.loop = true;
  sound.volume = 0.7;
});

function toggleSound(name) {
  const sound = sounds[name];
  if (sound.paused) {
    sound.play();
  } else {
    sound.pause();
  }
  unlockBadge("soundMixer");
}

function stopAll() {
  Object.values(sounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}

// 🎧 Sound Aura Presets
function playPreset() {
  const type = document.getElementById("soundType").value;

  stopAll(); // Stop everything first

  if (type === "rainy") {
    sounds["rain"].play();
    sounds["piano"].play();
  } else if (type === "ocean") {
    sounds["waves"].play();
    sounds["chimes"].play();
  } else if (type === "forest") {
    sounds["forest"].play();
    sounds["asmr"].play();
  } else if (type === "warm") {
    sounds["piano"].play();
    sounds["asmr"].play();
  } else if (type === "night") {
    sounds["chimes"].play();
    sounds["waves"].play();
  }

  unlockBadge("soundMixer");
}
