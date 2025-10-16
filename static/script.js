const video = document.getElementById('video');
const moodResult = document.getElementById('moodResult');
const startScanBtn = document.getElementById('startScanBtn');
const badgePopup = document.getElementById('badgePopup');
const badgeImage = document.getElementById('badgeImage');
const badgeText = document.getElementById('badgeText');
// Background interactive particles
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 100;

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.02;
  }
  draw() {
    ctx.fillStyle = "rgba(0,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].size <= 0.2) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleParticles();
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("mousemove", (e) => {
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(e.x, e.y));
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


// Access camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => {
        console.error('Camera error:', err);
        moodResult.textContent = 'Camera access blocked!';
    });

// Click to scan
startScanBtn.addEventListener('click', detectMood);

// Fake mood detection for now (replace with AI later)
function detectMood() {
    const moods = [
        "happy", "angry", "sad", "excited", "tired",
        "shocked", "crying", "creative", "bored", "scared", "disgusted"
    ];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    showMood(mood);
}

// Display mood and effects
function showMood(mood) {
    moodResult.textContent = `Detected mood: ${mood}`;
    moodResult.style.color = getMoodColor(mood);
    document.body.style.backgroundColor = getMoodColor(mood);
    moodResult.style.animation = 'moodGlow 1.5s ease-in-out infinite';

    // Play mood sound (fallback if missing)
    let moodSound = new Audio(`sounds/${mood}.mp3`);
    moodSound.onerror = () => {
        console.warn(`Sound for ${mood} missing. Playing default.`);
        new Audio('sounds/default.mp3').play();
    };
    moodSound.play();

    // Unlock badge for certain moods
    if (["happy", "excited", "creative"].includes(mood)) {
        unlockBadge(mood);
    }
}

// Badge unlock system
function unlockBadge(mood) {
    badgeImage.src = `badges/${mood}.png`;
    badgeText.textContent = `Badge Unlocked: ${mood.toUpperCase()}!`;
    badgePopup.classList.remove('hidden');
    setTimeout(() => badgePopup.classList.add('show'), 50);

    // Play badge sound
    let badgeSound = new Audio('sounds/badge-unlock.mp3');
    badgeSound.onerror = () => console.warn("Badge unlock sound missing.");
    badgeSound.play();

    // Hide popup after 3 seconds
    setTimeout(() => {
        badgePopup.classList.remove('show');
        setTimeout(() => badgePopup.classList.add('hidden'), 500);
    }, 3000);
}

// Mood colors
function getMoodColor(mood) {
    const colors = {
        happy: "#FFD700",
        angry: "#FF0000",
        sad: "#1E90FF",
        excited: "#FF69B4",
        tired: "#8B4513",
        shocked: "#FFFF00",
        crying: "#00BFFF",
        creative: "#FF8C00",
        bored: "#808080",
        scared: "#800080",
        disgusted: "#006400"
    };
    return colors[mood] || "#FFFFFF";
}
// Handle signup form
document.getElementById("signupForm")?.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const country = document.getElementById("country").value;

  // Store user data in localStorage
  localStorage.setItem("userName", name);
  localStorage.setItem("userAge", age);
  localStorage.setItem("userCountry", country);

  // Redirect to home
  window.location.href = "home.html";
});

// Guest button handler
function continueAsGuest() {
  localStorage.setItem("userName", "Guest");
  localStorage.setItem("userAge", "");
  localStorage.setItem("userCountry", "");
  window.location.href = "home.html";
}
// Personalized content on Games page
if (window.location.pathname.includes("moodgame.html")) {
  const userName = localStorage.getItem("userName") || "Guest";
  const age = parseInt(localStorage.getItem("userAge")) || 0;
  const country = localStorage.getItem("userCountry") || "other";

  const msg = document.getElementById("personalMessage");
  const rec = document.getElementById("recommendations");

  msg.innerText = `Hi ${userName}! Here are some games and recommendations just for you:`;

  let html = "";

  // Age-based content
  if (age > 0 && age < 18) {
    html += `<p>🌟 Since you’re under 18, here’s a fun game playlist to keep you positive and entertained!</p>`;
  } else if (age >= 18) {
    html += `<p>💡 Since you’re ${age}, here are some motivational and relaxing resources to help you recharge.</p>`;
  }

  // Country-based songs/quotes
  if (country.toLowerCase() === "india") {
    html += `
      <p>🎶 Here's a Hindi song for you: <a href="https://www.youtube.com/watch?v=ZqNJo4slZ7E" target="_blank">Tum Hi Ho - Arijit Singh</a></p>
      <p>📝 Hindi Quote: "हर दिन एक नई शुरुआत है।"</p>
    `;
  } else {
    html += `
      <p>🎶 Here's an English song for you: <a href="https://www.youtube.com/watch?v=ktvTqknDobU" target="_blank">Imagine Dragons - Radioactive</a></p>
      <p>📝 Quote: "Every day is a fresh start."</p>
    `;
  }

  rec.innerHTML = html;
}
/* =======================
   Background Particles (shared on all pages)
   ======================= */
(function initParticles(){
  const canvas = document.getElementById("bgCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener("resize", resize);

  let particles = [];
  class P {
    constructor(x,y){
      this.x=x; this.y=y;
      this.s=Math.random()*3+1;
      this.vx=Math.random()*2-1;
      this.vy=Math.random()*2-1;
      this.life=120 + Math.random()*80;
    }
    update(){
      this.x+=this.vx; this.y+=this.vy; this.life--;
      if(this.s>0.2) this.s-=0.015;
    }
    draw(){
      ctx.fillStyle="rgba(0,255,255,0.75)";
      ctx.beginPath(); ctx.arc(this.x,this.y,this.s,0,Math.PI*2); ctx.fill();
    }
  }
  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<particles.length;i++){
      const p=particles[i]; p.update(); p.draw();
      if(p.life<=0 || p.s<=0.2){ particles.splice(i,1); i--; }
    }
    requestAnimationFrame(loop);
  }
  loop();
  function spawn(x,y){ for(let i=0;i<5;i++) particles.push(new P(x,y)); }
  window.addEventListener("mousemove", e=> spawn(e.clientX,e.clientY), {passive:true});
  window.addEventListener("touchmove", e=>{
    const t=e.touches[0]; if(t) spawn(t.clientX,t.clientY);
  }, {passive:true});
})();

/* =======================
   Games page personalization (moodgame.html)
   ======================= */
(function gamesPersonalization(){
  if(!location.pathname.endsWith("moodgame.html")) return;
  const userName = localStorage.getItem("userName") || "Guest";
  const age = parseInt(localStorage.getItem("userAge")) || 0;
  const country = (localStorage.getItem("userCountry") || "other").toLowerCase();
  const msg = document.getElementById("personalMessage");
  const rec = document.getElementById("recommendations");
  if(msg) msg.textContent = `Hi ${userName}! Pick something relaxing below.`;

  let html = "";
  if(age>0 && age<18){
    html += `<p>🌟 You might enjoy lighter, playful experiences. Try “Dot Connect” or “Paint Your Mood”.</p>`;
  } else if(age>=18){
    html += `<p>💡 Need to reset? Start with “Breathing Session”, then try “Soothing Sounds Mixer”.</p>`;
  }
  if(country==="india"){
    html += `<p>🎶 You may like Hindi vibes. Try a calm playlist later or a soft flute sound in the mixer.</p>`;
  } else {
    html += `<p>🎶 English/ambient playlists pair great with these games. Keep it gentle and slow.</p>`;
  }
  if(rec) rec.innerHTML = html;
})();

/* =======================
   Breathing Session (breathing.html)
   ======================= */
(function breathingGame(){
  if(!location.pathname.endsWith("breathing.html")) return;

  const canvas = document.getElementById("breathCanvas");
  const ctx = canvas.getContext("2d");
  const instruction = document.getElementById("breathInstruction");
  const patternSel = document.getElementById("pattern");
  const durationSel = document.getElementById("duration");
  const startBtn = document.getElementById("startBreath");
  const stopBtn = document.getElementById("stopBreath");

  let animId=null, running=false, startTime=0, totalMs=0;
  let phaseDurations = { inhale: 4, hold: 4, exhale: 4, hold2: 4 }; // defaults (box)
  let cycleMs= (4+4+4+4)*1000;

  function setPattern(name){
    if(name==="box"){ phaseDurations = { inhale:4, hold:4, exhale:4, hold2:4 }; }
    else if(name==="478"){ phaseDurations = { inhale:4, hold:7, exhale:8, hold2:0 }; }
    else { phaseDurations = { inhale:5, hold:2, exhale:5, hold2:0 }; } // calm
    cycleMs = (phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale + phaseDurations.hold2)*1000;
  }

  function phaseAt(tMs){
    let t = tMs % cycleMs;
    const i = phaseDurations.inhale*1000;
    const h = phaseDurations.hold*1000;
    const e = phaseDurations.exhale*1000;
    const h2= phaseDurations.hold2*1000;

    if(t < i) return {phase:"Inhale", progress:t/i};
    t -= i;
    if(t < h) return {phase:"Hold", progress:t/h};
    t -= h;
    if(t < e) return {phase:"Exhale", progress:t/e};
    t -= e;
    return {phase:"Hold", progress: h2? (t/h2) : 1};
  }

  function draw(tMs){
    const {phase, progress} = phaseAt(tMs);
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);

    // background soft aura
    const g=ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,Math.min(w,h)/2);
    g.addColorStop(0, "rgba(0,255,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    // circle radius based on inhale/exhale
    const minR=60, maxR=160;
    let r=minR;
    if(phase==="Inhale") r = minR + (maxR-minR)*progress;
    else if(phase==="Exhale") r = maxR - (maxR-minR)*progress;
    else if(phase==="Hold") r = (phaseDurations.hold>0 || phaseDurations.hold2>0) ? (phaseAt(tMs-10).phase==="Inhale" ? maxR : minR) : maxR;

    // ring
    ctx.beginPath();
    ctx.arc(w/2,h/2,r,0,Math.PI*2);
    ctx.strokeStyle = "rgba(255,0,255,0.8)";
    ctx.lineWidth = 8; ctx.stroke();

    // center dot
    ctx.beginPath();
    ctx.arc(w/2,h/2,6,0,Math.PI*2);
    ctx.fillStyle="#00e0ff"; ctx.fill();

    if(instruction){
      instruction.textContent = `${phase}…`;
      instruction.style.animation = "softPulse 2s infinite";
    }
  }

  function loop(){
    if(!running) return;
    const now=performance.now();
    const t = now - startTime;
    if(t >= totalMs){
      // auto stop after duration
      running=false; cancelAnimationFrame(animId);
      instruction.textContent="Session complete. You did great ✨";
      return;
    }
    draw(t);
    animId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener("click", ()=>{
    setPattern(patternSel.value);
    const minutes = parseInt(durationSel.value || "3", 10);
    totalMs = minutes * 60 * 1000;
    startTime = performance.now();
    running=true;
    loop();
  });

  stopBtn.addEventListener("click", ()=>{
    running=false; if(animId) cancelAnimationFrame(animId);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    instruction.textContent="Paused. Breathe at your own pace 💫";
    instruction.style.animation = "none";
  });
})();

/* =======================
   Dot Connect (dotconnect.html)
   ======================= */
(function dotConnect(){
  if(!location.pathname.endsWith("dotconnect.html")) return;

  const cvs = document.getElementById("dotCanvas");
  const ctx = cvs.getContext("2d");
  const gridSel = document.getElementById("gridSize");
  const btnClear = document.getElementById("clearDots");
  const btnSave = document.getElementById("saveDots");

  let grid=8, dots=[], lines=[];
  let dragging=false, lastDotIndex=null;

  function genDots(){
    dots=[];
    const pad=30;
    const w=cvs.width - pad*2, h=cvs.height - pad*2;
    const cols=grid, rows=grid;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const x = pad + (w/(cols-1))*c;
        const y = pad + (h/(rows-1))*r;
        dots.push({x,y});
      }
    }
  }

  function drawAll(){
    ctx.clearRect(0,0,cvs.width,cvs.height);

    // draw lines first (glow)
    lines.forEach(([a,b])=>{
      ctx.shadowColor="rgba(255,0,255,0.8)";
      ctx.shadowBlur=12;
      ctx.lineWidth=4;
      ctx.strokeStyle="rgba(255,0,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(dots[a].x,dots[a].y);
      ctx.lineTo(dots[b].x,dots[b].y);
      ctx.stroke();
      ctx.shadowBlur=0;
    });

    // draw dots
    dots.forEach(d=>{
      const grad=ctx.createRadialGradient(d.x,d.y,2,d.x,d.y,10);
      grad.addColorStop(0,"#00e0ff");
      grad.addColorStop(1,"rgba(0,224,255,0)");
      ctx.fillStyle=grad;
      ctx.beginPath(); ctx.arc(d.x,d.y,6,0,Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(d.x,d.y,3,0,Math.PI*2);
      ctx.fillStyle="#cfffff"; ctx.fill();
    });
  }

  function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
  function nearestDot(x,y){
    let idx=-1, best=9999;
    dots.forEach((d,i)=>{
      const dd=dist(d,{x,y});
      if(dd<best){ best=dd; idx=i; }
    });
    return (best<18) ? idx : -1; // snap radius
  }

  function startDrag(x,y){
    const idx = nearestDot(x,y);
    if(idx>=0){ dragging=true; lastDotIndex=idx; ping(); }
  }
  function dragMove(x,y){
    if(!dragging) return;
    const idx = nearestDot(x,y);
    if(idx>=0 && idx!==lastDotIndex){
      lines.push([lastDotIndex, idx]);
      lastDotIndex = idx;
      ping();
      drawAll();
    }
  }
  function endDrag(){ dragging=false; lastDotIndex=null; }

  function ping(){
    // optional: soft chime if you add /sounds/chime.mp3
    const a = new Audio("sounds/chime.mp3");
    a.volume=0.35;
    a.play().catch(()=>{ /* ignore autoplay block */ });
  }

  // mouse
  cvs.addEventListener("mousedown", e=>{
    const rect=cvs.getBoundingClientRect();
    startDrag(e.clientX-rect.left, e.clientY-rect.top);
  });
  window.addEventListener("mousemove", e=>{
    if(!dragging) return;
    const rect=cvs.getBoundingClientRect();
    dragMove(e.clientX-rect.left, e.clientY-rect.top);
  });
  window.addEventListener("mouseup", endDrag);

  // touch
  cvs.addEventListener("touchstart", e=>{
    const t=e.touches[0]; const rect=cvs.getBoundingClientRect();
    startDrag(t.clientX-rect.left, t.clientY-rect.top);
  }, {passive:true});
  window.addEventListener("touchmove", e=>{
    const t=e.touches[0]; if(!t) return;
    const rect=cvs.getBoundingClientRect();
    dragMove(t.clientX-rect.left, t.clientY-rect.top);
  }, {passive:true});
  window.addEventListener("touchend", endDrag);

  btnClear.addEventListener("click", ()=>{ lines=[]; drawAll(); });
  btnSave.addEventListener("click", ()=>{
    const a=document.createElement("a");
    a.download="dot-connect.png";
    a.href=cvs.toDataURL("image/png");
    a.click();
  });

  // init
  function reset(){
    grid=parseInt(gridSel.value,10)||8;
    genDots(); lines=[]; drawAll();
  }
  gridSel.addEventListener("change", reset);
  reset();
})();
/* =======================
   Soothing Sounds Mixer (sounds.html)
   ======================= */
(function soothingSounds(){
  if(!location.pathname.endsWith("sounds.html")) return;

  const buttons = document.querySelectorAll(".sound-btn");
const sounds = {
  piano: new Audio("{{ url_for('static', filename='sounds/piano.mp3') }}"),
  chimes: new Audio("{{ url_for('static', filename='sounds/chimes.mp3') }}"),
  forest: new Audio("{{ url_for('static', filename='sounds/forest.mp3') }}"),
  waves: new Audio("{{ url_for('static', filename='sounds/waves.mp3') }}"),
  asmr: new Audio("{{ url_for('static', filename='sounds/asmr.mp3') }}"),
  rain: new Audio("{{ url_for('static', filename='sounds/rain.mp3') }}")
};

  // loop forever
  for(const key in sounds){ sounds[key].loop = true; sounds[key].volume = 0.6; }

  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const key = btn.dataset.sound;
      if(!sounds[key]) return;

      if(sounds[key].paused){
        sounds[key].play().catch(()=>{});
        btn.classList.add("active");
      } else {
        sounds[key].pause();
        btn.classList.remove("active");
      }
    });
  });
})();
/* =======================
   Quotes & Reflection (quotes.html)
   ======================= */
(function quotesGame(){
  if(!location.pathname.endsWith("quotes.html")) return;

  const quotes = [
    "Every day is a fresh start.",
    "You are stronger than you think.",
    "Breathe. Relax. Let go.",
    "Small steps every day lead to big changes.",
    "Your story is still being written.",
    "Peace begins with a deep breath.",
    "Storms make trees take deeper roots."
  ];

  const quoteText = document.getElementById("quoteText");
  const newQuoteBtn = document.getElementById("newQuote");
  const reflectionBox = document.getElementById("reflectionBox");
  const saveBtn = document.getElementById("saveReflection");
  const saveMessage = document.getElementById("saveMessage");

  function showRandomQuote() {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.innerText = random;
  }

  // load a random quote on page load
  showRandomQuote();

  newQuoteBtn.addEventListener("click", showRandomQuote);

  saveBtn.addEventListener("click", () => {
    const text = reflectionBox.value.trim();
    if(text){
      const reflections = JSON.parse(localStorage.getItem("mindOrbitReflections") || "[]");
      reflections.push({date: new Date().toLocaleString(), text});
      localStorage.setItem("mindOrbitReflections", JSON.stringify(reflections));
      saveMessage.innerText = "✅ Reflection saved privately.";
      reflectionBox.value = "";
      setTimeout(()=> saveMessage.innerText = "", 3000);
    } else {
      saveMessage.innerText = "⚠️ Please write something before saving.";
    }
  });
})();
async function sendMessage() {
  const userInput = document.getElementById("userInput").value;
  const response = await fetch("https://your-deployed-flask-url/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userInput })
  });
  const data = await response.json();
  document.getElementById("chatBox").innerHTML += <p><b>Robust AI:</b> ${data.reply}</p>;
}
