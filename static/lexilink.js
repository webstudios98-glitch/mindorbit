// lexilink.js — futuristic circular word builder
(() => {
  const lettersEl = document.getElementById("letters");
  const wordInput = document.getElementById("wordInput");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const timerEl = document.getElementById("timer");
  const scoreEl = document.getElementById("score");
  const msgEl = document.getElementById("message");
  const pingSound = document.getElementById('pingSound'); 
  
  // ---- CONFIG ----
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const GAME_TIME = 60;
  const NODE_COLORS = ["c0", "c1", "c2", "c3", "c4"];
  const WORDS = ["CODE", "AI", "BRAIN", "LOGIC", "NEON", "MIND", "WORD", "LIGHT", "DATA", "TECH"];
  const NODE_COUNT = 8; // number of letters around the circle

  let currentLetters = [];
  let currentWord = "";
  let score = 0;
  let timer = GAME_TIME;
  let dragging = false;
  let path = [];
  let timerInterval = null;

  // ---- INIT ----
  function init() {
    generateLetters();
    renderLetters();
    startTimer();

    submitBtn.addEventListener("click", submitWord);
    clearBtn.addEventListener("click", clearWord);
    wordInput.addEventListener("input", () => {
      currentWord = wordInput.value.toUpperCase();
    });

    lettersEl.addEventListener("mousedown", startDrag);
    lettersEl.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);

    lettersEl.addEventListener("touchstart", startDrag, { passive: false });
    lettersEl.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
  }

  // ---- LETTER GENERATION ----
  function generateLetters() {
    currentLetters = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const ch = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      const color = NODE_COLORS[i % NODE_COLORS.length];
      currentLetters.push({ ch, color });
    }
  }

  function renderLetters() {
    lettersEl.innerHTML = "";
    const radius = lettersEl.offsetWidth / 2 - 50;
    const center = lettersEl.offsetWidth / 2;

    currentLetters.forEach((letter, i) => {
      const angle = (i / NODE_COUNT) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      const node = document.createElement("div");
      node.className = `letter-node ${letter.color}`;
      node.style.left = ${x - 32}px;
      node.style.top = ${y - 32}px;
      node.dataset.letter = letter.ch;

      const inner = document.createElement("div");
      inner.className = "inner";
      inner.textContent = letter.ch;
      node.appendChild(inner);

      node.addEventListener("click", () => addLetter(letter.ch, node));

      lettersEl.appendChild(node);
    });
  }

  // ---- DRAG HANDLERS ----
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    path = [];
    selectNode(e);
  }

  function moveDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    selectNode(e);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (currentWord.length > 0) submitWord();
  }

  function selectNode(e) {
    const touch = e.touches ? e.touches[0] : e;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.closest(".letter-node")) {
      const node = target.closest(".letter-node");
      const letter = node.dataset.letter;
      if (!node.classList.contains("selected")) {
        addLetter(letter, node);
      }
    }
  }

  // ---- WORD CREATION ----
  function addLetter(ch, node) {
    currentWord += ch;
    wordInput.value = currentWord;
    node.classList.add("selected");
    pingSound.currentTime = 0;
    pingSound.play();
  }

  function clearWord() {
    currentWord = "";
    wordInput.value = "";
    document.querySelectorAll(".letter-node.selected").forEach(n => n.classList.remove("selected"));
  }

  // ---- WORD SUBMISSION ----
  function submitWord() {
    if (currentWord.length < 2) {
      showMsg("❌ Too short");
      clearWord();
      return;
    }

    if (WORDS.includes(currentWord)) {
      score += currentWord.length * 10;
      scoreEl.textContent = Score: ${score};
      showMsg("✅ Great!");
    } else {
      showMsg("😅 Not a valid word");
    }

    clearWord();
    pingSound.currentTime = 0;
    pingSound.play();
  }

  // ---- TIMER ----
  function startTimer() {
    timer = GAME_TIME;
    timerEl.textContent = ⏳ ${timer}s;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer--;
      timerEl.textContent = ⏳ ${timer}s;
      if (timer <= 0) {
        clearInterval(timerInterval);
        showMsg("⏰ Time up!");
        disableGame();
      }
    }, 1000);
  }

  function disableGame() {
    document.querySelectorAll(".letter-node").forEach(n => n.style.pointerEvents = "none");
  }

  // ---- MESSAGE ----
  function showMsg(txt) {
    msgEl.textContent = txt;
    msgEl.style.opacity = 1;
    setTimeout(() => (msgEl.style.opacity = 0.4), 1500);
  }

  // ---- START ----
  window.addEventListener("load", init);
})();
