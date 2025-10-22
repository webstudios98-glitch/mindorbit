document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("breathingCanvas");
  const ctx = canvas.getContext("2d");
  const text = document.getElementById("breathingText");
  const startBtn = document.getElementById("startBreathBtn");

  let running = false;
  let phase = 0; // 0: inhale, 1: hold, 2: exhale
  let radius = 60;
  const center = { x: canvas.width / 2, y: canvas.height / 2 };

  function drawCircle(r) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#00ffe0";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";
    ctx.stroke();
  }

  function animateBreathing() {
    if (!running) return;

    if (phase === 0) {
      // inhale: expand
      text.textContent = "Breathe In...";
      radius += 0.8;
      if (radius >= 140) {
        phase = 1;
        setTimeout(() => { if (running) phase = 2; }, 2000); // hold for 2s
      }
    } else if (phase === 2) {
      // exhale: contract
      text.textContent = "Breathe Out...";
      radius -= 0.8;
      if (radius <= 60) {
        phase = 0;
      }
    }

    drawCircle(radius);
    requestAnimationFrame(animateBreathing);
  }

  startBtn.addEventListener("click", () => {
    running = !running;
    if (running) {
      startBtn.textContent = "Stop";
      phase = 0;
      animateBreathing();
    } else {
      startBtn.textContent = "Start";
      text.textContent = "Ready?";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
});
