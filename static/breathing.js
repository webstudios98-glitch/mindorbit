const bCanvas = document.getElementById("breathingCanvas");
const bCtx = bCanvas.getContext("2d");
const breathingText = document.getElementById("breathingText");

let radius = 50;
let growing = true;
let phase = 0;
let interval;

function drawBreathingCircle() {
  bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);

  // Circle
  bCtx.beginPath();
  bCtx.arc(bCanvas.width / 2, bCanvas.height / 2, radius, 0, Math.PI * 2);
  bCtx.strokeStyle = "#00ffe0";
  bCtx.lineWidth = 6;
  bCtx.shadowColor = "#ff00ff";
  bCtx.shadowBlur = 20;
  bCtx.stroke();
}

function updateBreathing() {
  if (phase === 0) {
    breathingText.innerText = "🌬️ Breathe In...";
    if (radius < 150) radius += 1.5;
    else phase = 1;
  } else if (phase === 1) {
    breathingText.innerText = "⏸️ Hold...";
    setTimeout(() => { phase = 2; }, 1500);
  } else if (phase === 2) {
    breathingText.innerText = "😮‍💨 Breathe Out...";
    if (radius > 50) radius -= 1.5;
    else phase = 0;
  }
  drawBreathingCircle();
}

function startBreathing() {
  if (interval) clearInterval(interval);
  phase = 0;
  radius = 50;
  interval = setInterval(updateBreathing, 30);
}

// initial draw
drawBreathingCircle();
console.log("Static JS loaded!");
// Breathing session toggle (Start / Stop)
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startScanBtn') || document.getElementById('startBreathBtn') || document.querySelector('.start-btn');
  const breatheCircle = document.querySelector('.breathe-circle') || document.getElementById('breatheCircle');
  const moodText = document.getElementById('moodResult') || document.getElementById('statusText');
  let sessionRunning = false;
  let sessionInterval = null; // if you use intervals/timers

  // helper to set button state
  function setButtonState(running) {
    if (!startBtn) return;
    sessionRunning = !!running;
    if (sessionRunning) {
      startBtn.textContent = 'Stop';
      startBtn.setAttribute('aria-label', 'Stop breathing session');
      startBtn.classList.add('stop');    // for styling if you want
      startBtn.classList.remove('start');
    } else {
      startBtn.textContent = 'Start';
      startBtn.setAttribute('aria-label', 'Start breathing session');
      startBtn.classList.add('start');
      startBtn.classList.remove('stop');
    }
  }

  // start behavior — play animation, sound, start timers
  function startSession() {
    // visual: add a class that triggers CSS animation (scale/pulse)
    if (breatheCircle) breatheCircle.classList.add('breathing');

    // optional: start background tone or guided voice
    // if (toneAudio) toneAudio.play().catch(()=>{});

    // set status text
    if (moodText) moodText.textContent = 'Breathe In...';

    // example timer logic (replace with your real timing/animation)
    let step = 0;
    sessionInterval = setInterval(() => {
      step = (step + 1) % 3;
      if (moodText) {
        if (step === 0) moodText.textContent = 'Breathe In...';
        else if (step === 1) moodText.textContent = 'Hold...';
        else moodText.textContent = 'Breathe Out...';
      }
    }, 4000); // change duration as required

    setButtonState(true);
  }

  // stop behavior — stop animation, sound, timers
  function stopSession() {
    if (breatheCircle) breatheCircle.classList.remove('breathing');

    if (sessionInterval) {
      clearInterval(sessionInterval);
      sessionInterval = null;
    }

    // optional: stop audio
    // if (toneAudio) { toneAudio.pause(); toneAudio.currentTime = 0; }

    if (moodText) moodText.textContent = 'Session stopped.';
    setButtonState(false);
  }

  // attach to button
  if (startBtn) {
    // ensure initial label
    setButtonState(false);

    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!sessionRunning) {
        startSession();
      } else {
        stopSession();
      }
    });
  } else {
    console.warn('Start/Stop button not found (id: startScanBtn or startBreathBtn or .start-btn).');
  }

  // optional: stop session when leaving page or on nav
  window.addEventListener('beforeunload', () => {
    if (sessionRunning) stopSession();
  });
});
