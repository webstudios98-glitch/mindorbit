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