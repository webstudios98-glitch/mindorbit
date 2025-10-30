// Smooth Scroll to Features
function scrollToFeatures() {
  document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
}

// Background Galaxy Effect
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

let stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.5 });
}

function animateStars() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    s.y += 0.2;
    if (s.y > innerHeight) s.y = 0;
  });
  requestAnimationFrame(animateStars);
}
animateStars();

// Fade-in Animation on Scroll
const features = document.querySelectorAll('.feature');
window.addEventListener('scroll', () => {
  features.forEach(f => {
    const rect = f.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) f.classList.add('visible');
  });
});
