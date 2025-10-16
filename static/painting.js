const paintCanvas = document.getElementById("paintCanvas");
const pCtx = paintCanvas.getContext("2d");

// initial settings
let painting = false;
let brushColor = document.getElementById("color").value;
let brushSize = document.getElementById("size").value;

function startPosition(e) {
  painting = true;
  draw(e); // start drawing immediately on click
}

function endPosition() {
  painting = false;
  pCtx.beginPath(); // reset path so lines don’t connect
}

function draw(e) {
  if (!painting) return;

  const rect = paintCanvas.getBoundingClientRect(); // fix for wrong offsets
  const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

  pCtx.lineWidth = brushSize;
  pCtx.lineCap = "round";
  pCtx.strokeStyle = brushColor;
  pCtx.shadowBlur = 20;
  pCtx.shadowColor = brushColor;

  pCtx.lineTo(x, y);
  pCtx.stroke();
  pCtx.beginPath();
  pCtx.moveTo(x, y);
}

function clearCanvas() {
  pCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function savePainting() {
  const link = document.createElement("a");
  link.download = "painting.png";
  link.href = paintCanvas.toDataURL();
  link.click();
}

// Mouse events
paintCanvas.addEventListener("mousedown", startPosition);
paintCanvas.addEventListener("mouseup", endPosition);
paintCanvas.addEventListener("mousemove", draw);

// Touch events (mobile)
paintCanvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startPosition(e);
});
paintCanvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  endPosition(e);
});
paintCanvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  draw(e);
});

// Update brush settings
document.getElementById("color").addEventListener("change", (e) => brushColor = e.target.value);
document.getElementById("size").addEventListener("input", (e) => brushSize = e.target.value);
9876   