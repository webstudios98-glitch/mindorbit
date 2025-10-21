// lexilink.js — fixed playable version
(() => {
  const lettersEl = document.getElementById("letters");
  const wordInput = document.getElementById("wordInput");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const timerEl = document.getElementById("timer");
  const scoreEl = document.getElementById("score");
  const msgEl = document.getElementById("message");
  const pingSound = document.getElementById("pingSound");

  // ---- CONFIG ----
  const NODE_COLORS = ["c0", "c1", "c2", "c3", "c4"];
  const GAME_TIME = 60;

  // Word bank with real, short words (expand anytime)
  const WORD_BANK = [
    "CODE","DATA","MIND","AI","LIGHT","TECH","PLAY","SMART","WAVE",
    "NODE","LINK","BUILD","LOGIC","GLOW","HEART","CORE","DREAM","BRAIN"
  ];

  let currentLetters = [];
  let validWords = [];
  let currentWord = "";
  let score = 0;
  let timer = GAME_TIME;
  let dragging = false;
  let timerInterval = null;

  // ---- Letter Generator ----
  function generatePlayableLetters() {
    // Pick one real base word from the bank
    const baseWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const letters = baseWord.split("");

    // Add random letters so total = 8
    const extras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (letters.length < 8) {
      letters.push(extras[Math.floor(Math.random() * extras.length)]);
    }

    // Shuffle for randomness
    letters.sort(() => Math.random() - 0.5);

    // Save this word as one of valid ones
    validWords = [baseWord];
    return letters;
  }

  // ---- Init ----
  function init() {
    const letters = generatePlayableLetters();
    currentLetters = letters.map((ch, i) => ({
      ch,
      color: NODE_COLORS[i % NODE_COLORS.length]
    }));

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

  // ---- Render letters around the circle ----
  function renderLetters() {
    lettersEl.innerHTML = "";
    const radius = lettersEl.offsetWidth / 2 - 40;
    const center = lettersEl.offsetWidth / 2;

    currentLetters.forEach((letter, i) => {
      const angle = (i / currentLetters.length) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      const node = document.createElement("div");
      node.className = letter-node `${letter.color}`;
      node.style.left = `${x - 32}px`;
      node.style.top = `${y - 32}px`;
      node.dataset.letter = letter.ch;

      const inner = document.createElement("div");
      inner.className = "inner";
      inner.textContent = letter.ch;
      node.appendChild(inner);

      node.addEventListener("click", () => addLetter(letter.ch, node));
      lettersEl.appendChild(node);
    });
  }

  // ---- Word Creation ----
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

  // ---- Submit Word ----
  function submitWord() {
    if (currentWord.length < 2) {
      showMsg("❌ Too short");
      clearWord();
      return;
    }

    if (validWords.includes(currentWord)) {
      score += currentWord.length * 10;
      scoreEl.textContent = `Score: ${score}`;
      showMsg("✅ Great!");
      pingSound.currentTime = 0;
      pingSound.play();
      setTimeout(nextRound, 1000); // generate new letters
    } else {
      showMsg("😅 Not a valid word");
    }

    clearWord();
  }

  // ---- Timer ----
  function startTimer() {
    timer = GAME_TIME;
  timerEl.textContent = `⏳ ${timer}s`;   // ✅ works
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer--;
       timerEl.textContent = `⏳ ${timer}s`;   // ✅ works
      if (timer <= 0) {
        clearInterval(timerInterval);
        showMsg("⏰ Time up!");
        disableGame();
      }
    }, 1000);
  }

  function disableGame() {
    document.querySelectorAll(".letter-node").forEach(n => (n.style.pointerEvents = "none"));
  }

  // ---- Next Round ----
  function nextRound() {
    const letters = generatePlayableLetters();
    currentLetters = letters.map((ch, i) => ({
      ch,
      color: NODE_COLORS[i % NODE_COLORS.length]
    }));
    renderLetters();
  }

  // ---- Drag Handlers ----
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
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

  // ---- Message ----
  function showMsg(txt) {
    msgEl.textContent = txt;
    msgEl.style.opacity = 1;
    setTimeout(() => (msgEl.style.opacity = 0.4), 1500);
  }

  // ---- Start ----
  window.addEventListener("load", init);
})();
