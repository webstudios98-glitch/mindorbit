// floating stars animation
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    speed: Math.random() * 0.3
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffe0";
  for (let s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height) s.y = 0;
  }
  requestAnimationFrame(drawStars);
}
drawStars();

// smooth scroll on button click
document.getElementById("scrollDown").addEventListener("click", () => {
  window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
});

// fade-in on scroll
const sections = document.querySelectorAll(".feature");
window.addEventListener("scroll", () => {
  const trigger = window.innerHeight * 0.8;
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < trigger) sec.classList.add("visible");
  });
});
