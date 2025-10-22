// === script.js - Fixed LexiLink game ===
// Rano — improved positioning and touch/mouse drag support

window.addEventListener('load', () => {
  const plate = document.querySelector('.circle-plate');
  const wordDisplay = document.getElementById('word-display');

  // Safety check
  if (!plate || !wordDisplay) {
    console.error('Missing .circle-plate or #word-display in DOM');
    return;
  }

  // --- Config ---
  const randomWordSet = [
    "MIND", "CODE", "STAR", "PLAY", "LINK", "DATA",
    "BYTE", "FLOW", "NODE", "TECH", "AI", "CLOUD", 
    "WOLF", "DONE", "TATA" , "INK" , "LAY" , "MOOD" ,
    "COOL" , "FOOL",
  ];
  const nodeSize = 65; // used for centering nodes
  let letters = [];    // DOM nodes
  let dragging = false;
  let currentWord = "";

  // --- Create letter nodes positioned in a circle ---
  function createLetters() {
    plate.innerHTML = ""; // clear old
    letters = [];

    // pick a random base word
    const word = randomWordSet[Math.floor(Math.random() * randomWordSet.length)];
    const count = word.length;

    // compute center and radius based on actual plate size
    const plateRect = plate.getBoundingClientRect();
    const centerX = plateRect.width / 2;
    const centerY = plateRect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.65;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2; // start top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const div = document.createElement('div');
      div.classList.add('letter-node', 'new');
      div.textContent = word[i];

      // position the node (centered)
      div.style.left = `${Math.round(x - nodeSize / 2)}px`;
      div.style.top = `${Math.round(y - nodeSize / 2)}px`;

      // pointer events: mouse + touch
      div.addEventListener('mousedown', startDrag);
      div.addEventListener('touchstart', startDrag, { passive: false });

      letters.push(div);
      plate.appendChild(div);

      // remove 'new' class after animation so it doesn't re-animate later
      setTimeout(() => div.classList.remove('new'), 500);
    }

    currentWord = "";
    wordDisplay.textContent = "Connect letters to form a word";
    wordDisplay.style.color = "";
  }

  // --- Drag handlers ---
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    currentWord = "";
    wordDisplay.textContent = "";
    letters.forEach(l => l.classList.remove('active'));

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', endDrag);

    const target = e.target;
    if (target && target.classList.contains('letter-node')) {
      target.classList.add('active');
      currentWord += target.textContent;
      wordDisplay.textContent = currentWord;
    }
  }

  function dragMove(e) {
    if (!dragging) return;
    // get touch or mouse coordinates
    const touch = e.touches ? e.touches[0] : e;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;

    if (el.classList && el.classList.contains('letter-node') && !el.classList.contains('active')) {
      el.classList.add('active');
      currentWord += el.textContent;
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
      // show nothing or a hint
      wordDisplay.textContent = "";
    }

    // reset active class after a short delay (let user see the selection)
    setTimeout(() => letters.forEach(l => l.classList.remove('active')), 350);
  }

  // --- Word validation ---
  function checkWord(word) {
    const upper = word.toUpperCase();
    if (randomWordSet.includes(upper)) {
      wordDisplay.textContent = `✅ ${upper} found!`;
      wordDisplay.style.color = "#00ff9f";

      // animate out current letters, then generate new ones
      letters.forEach(l => {
        l.style.transition = "transform 0.35s ease, opacity 0.35s ease";
        l.style.transform = "scale(1.3)";
        l.style.opacity = "0";
      });

      setTimeout(() => createLetters(), 700);
    } else {
      wordDisplay.textContent = `❌ ${upper} not valid`;
      wordDisplay.style.color = "#ff6961";
      // reset so player can try again
      setTimeout(() => {
        wordDisplay.textContent = "";
        wordDisplay.style.color = "";
      }, 1000);
    }
  }

  // handle window resize (reposition letters)
  window.addEventListener('resize', () => {
    // recreate to reposition nodes nicely
    createLetters();
  });

  // initial
  createLetters();
});
function pingSound() {
  const ping = document.getElementById('pingSound');
  if (ping) {
    ping.currentTime = 0;
    ping.volume = 0.4;  // optional
    ping.play().catch(() => {});
  }
}
