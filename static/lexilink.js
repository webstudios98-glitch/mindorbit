// === LEXILINK WORD GAME ===
// By Rano 💫 (MindOrbit project style)

const plate = document.querySelector('.circle-plate');
const wordDisplay = document.getElementById('word-display');

let letters = [];
let dragging = false;
let currentWord = "";

// --- LETTER POOL (random generation) ---
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const randomWordSet = [
  "MIND", "CODE", "STAR", "PLAY", "LINK", "DATA",
  "BYTE", "FLOW", "NODE", "TECH", "AI", "CLOUD"
];

// === INITIAL SETUP ===
function createLetters() {
  plate.innerHTML = ""; // clear old
  letters = [];

  const word = randomWordSet[Math.floor(Math.random() * randomWordSet.length)];
  const count = word.length;
  const radius = 90; // controls spacing

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    const div = document.createElement('div');
    div.classList.add('letter-node', 'new');
    div.textContent = word[i];

    div.style.left = ${120 + x}px;
    div.style.top = ${120 + y}px;

    // Add dragging logic
    div.addEventListener('mousedown', startDrag);
    div.addEventListener('touchstart', startDrag);

    letters.push(div);
    plate.appendChild(div);
  }

  currentWord = "";
  wordDisplay.textContent = "Connect letters to form a word";
}

// === DRAGGING LOGIC ===
function startDrag(e) {
  e.preventDefault();
  dragging = true;
  currentWord = "";
  wordDisplay.textContent = "";
  letters.forEach(l => l.classList.remove('active'));

  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', dragMove);
  document.addEventListener('touchend', endDrag);

  const target = e.target;
  if (target.classList.contains('letter-node')) {
    target.classList.add('active');
    currentWord += target.textContent;
  }
}

function dragMove(e) {
  if (!dragging) return;

  const touch = e.touches ? e.touches[0] : e;
  const element = document.elementFromPoint(touch.clientX, touch.clientY);

  if (element && element.classList.contains('letter-node') && !element.classList.contains('active')) {
    element.classList.add('active');
    currentWord += element.textContent;
    wordDisplay.textContent = currentWord;
  }
}

function endDrag() {
  dragging = false;

  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', dragMove);
  document.removeEventListener('touchend', endDrag);

  if (currentWord.length > 1) {
    checkWord(currentWord);
  } else {
    wordDisplay.textContent = "";
  }

  // reset
  setTimeout(() => letters.forEach(l => l.classList.remove('active')), 400);
}

// === CHECK IF WORD IS VALID ===
function checkWord(word) {
  word = word.toUpperCase();

  if (randomWordSet.includes(word)) {
    wordDisplay.textContent = ✅ ${word} found!;
    wordDisplay.style.color = "#00ff9f";

    // add glow animation and new letters
    letters.forEach(l => {
      l.classList.add('active');
      l.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      l.style.transform = "scale(1.4)";
      l.style.opacity = "0";
    });

    setTimeout(() => createLetters(), 1000);
  } else {
    wordDisplay.textContent = ❌ ${word} not valid;
    wordDisplay.style.color = "#ff6961";
  }
}

// === INIT ===
createLetters();
