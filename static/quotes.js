const quotes = [
  "🌌 The stars don’t ask you to hurry — neither should you.",
  "🌀 Sometimes chaos is just the universe whispering in a new language.",
  "🌱 Growth feels uncomfortable because roots must break the soil.",
  "🔥 Your fire isn’t meant to warm everyone — protect your spark.",
  "🌊 Even the ocean retreats before it returns as a wave.",
  "🎭 Who would you be if nobody was watching?",
  "🌙 The moon borrows its light, yet nobody doubts its glow.",
  "🧩 Maybe you’re not lost — maybe you’re the missing piece.",
  "💡 Answers don’t always arrive; sometimes peace does instead.",
  "🚪 Doors don’t just open; sometimes you are the key."
];

const quoteText = document.getElementById("quoteText");
const newQuoteBtn = document.getElementById("newQuote");

function typeQuote(text) {
  quoteText.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    quoteText.innerHTML += text[i];
    i++;
    if (i === text.length) clearInterval(interval);
  }, 50); // typing speed
}

function showRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  typeQuote(random);
}

newQuoteBtn.addEventListener("click", showRandomQuote);
