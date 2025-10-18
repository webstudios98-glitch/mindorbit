(() => {
  const lettersEl = document.getElementById("letters");
  const wordInput = document.getElementById("wordInput");
  const submitBtn = document.getElementById("submitWord");
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const msgEl = document.getElementById("message");

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let letters = [], score = 0, timeLeft = 60, timer;

  function randomLetters() {
    letters = Array.from({ length: 7 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    lettersEl.textContent = letters.join(" ");
  }

  function startGame() {
    randomLetters();
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = ⏱ ${timeLeft}s;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function submitWord() {
    const word = wordInput.value.toUpperCase().trim();
    if (!word) return;

    const available = [...letters];
    for (let ch of word) {
      const idx = available.indexOf(ch);
      if (idx === -1) {
        msgEl.textContent = "❌ Invalid letters!";
        return;
      }
      available.splice(idx, 1);
    }

    const points = word.length * 10;
    score += points;
    scoreEl.textContent = Score: ${score};
    msgEl.textContent = ✅ +${points} points for "${word}"!;

    wordInput.value = "";
    randomLetters();
  }

  function endGame() {
    clearInterval(timer);
    wordInput.disabled = true;
    submitBtn.disabled = true;
    msgEl.textContent = 🏁 Time’s up! Final Score: ${score};
  }

  submitBtn.addEventListener("click", submitWord);
  wordInput.addEventListener("keypress", e => e.key === "Enter" && submitWord());

  startGame();
})();
