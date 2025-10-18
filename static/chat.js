// static/chat.js — improved logging and error handling
(function () {
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const clearBtn = document.getElementById("clearBtn");

  function appendMessage(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + (who === "user" ? "user" : "bot");
    div.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  function showTyping() {
    const t = document.createElement("div");
    t.id = "typingIndicator";
    t.className = "msg bot typing";
    t.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById("typingIndicator");
    if (t) t.remove();
  }

  async function sendToServer(message) {
    try {
     const res = await fetch("https://mindorbit-xqaq.onrender.com/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message })
});
      if (!res.ok) {
        const txt = await res.text().catch(()=>res.statusText);
        throw new Error("Server returned " + res.status + " - " + txt);
      }
      return await res.json();
    } catch (err) {
      console.error("sendToServer failed:", err);
      throw err;
    }
  }

  async function handleSend(text) {
    const t = (text || "").trim();
    if (!t) return;
    appendMessage(t, "user");
    inputEl.value = "";
    showTyping();
    try {
      const json = await sendToServer(t);
      hideTyping();
      const reply = json && json.reply ? json.reply : "Kuch problem. Try again.";
      appendMessage(reply, "bot");
      // optional: speak reply if browser supports
      if (window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(reply);
        utter.lang = /[\u0900-\u097F]/.test(reply) ? "hi-IN" : "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      hideTyping();
      appendMessage("Network or server error. Check the server console. (See browser console for details.)", "bot");
    }
  }

  sendBtn.addEventListener("click", () => handleSend(inputEl.value));
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputEl.value);
    }
  });

  clearBtn.addEventListener("click", () => {
    messagesEl.innerHTML = "";
    appendMessage("Robust is ready — ask me anything. (Robust runs in dev mode if server has no API key.)", "bot");
  });

  // Speech recognition (press & hold to speak)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recognition = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isListening = false;
    micBtn.addEventListener("mousedown", () => {
      try { recognition.start(); micBtn.textContent = "🎙 Listening..."; isListening = true; }
      catch(e){ console.warn("start error", e); }
    });
    window.addEventListener("mouseup", () => {
      if (isListening) { try { recognition.stop(); micBtn.textContent = "🎤 Speak"; isListening = false; } catch(e){} }
    });

    recognition.onresult = (ev) => {
      const spoken = (ev.results[0][0].transcript || "").trim();
      if (spoken) handleSend(spoken);
    };
    recognition.onerror = (ev) => {
      console.warn("Speech error", ev);
      appendMessage("Voice recognition error — please type instead.", "bot");
      micBtn.textContent = "🎤 Speak";
    };
  } else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not available in this browser";
    micBtn.style.opacity = 0.6;
  }

  // initial welcome
  window.addEventListener("DOMContentLoaded", () => {
    appendMessage("Arre waah! Robust aa gaya — batao, aaj kaisa feel kar rahe ho? (Hey! Robust is here — tell me how you're feeling today.)", "bot");
  });

})();
