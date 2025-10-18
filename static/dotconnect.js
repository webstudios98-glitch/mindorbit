(() => {
  // ===== Config =====
  const COLORS = [
    "#00E5FF", // cyan
    "#FF3CF3", // magenta
    "#FFB300", // amber
    "#7CFF8A", // mint
    "#A98BFF"  // violet
  ];
  const START_GRID = 8;
  const START_MOVES = 30;
  const SCORE_RULE = n => (n >= 3 ? (n - 2) * (n - 2) * 10 : 0); // rewards longer chains

  // ===== State =====
  let rows = START_GRID, cols = START_GRID;
  let grid = [];            // grid[r][c] = color string or null
  let score = 0;
  let moves = START_MOVES;
  let best = Number(localStorage.getItem("mindorbit_best") || 0);

  // selection path: array of {r,c,color}
  let path = [];
  let dragging = false;
  let allowColor = null;

  // DOM
  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const movesEl = document.getElementById("moves");
  const bestEl  = document.getElementById("best");
  const gridSel = document.getElementById("gridSize");
  const newBtn  = document.getElementById("newGame");

  // Canvas for connection lines
  const pathCanvas = document.createElement("canvas");
  pathCanvas.id = "pathCanvas";
  const pCtx = pathCanvas.getContext("2d");
  boardEl.appendChild(pathCanvas);

  const canvas = document.getElementById("dotCanvas");
const ctx = canvas.getContext("2d");

// Ensure correct canvas scaling on mobile
const scaleCanvas = () => {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.6;
};
window.addEventListener("resize", scaleCanvas);
scaleCanvas();

// --- your existing dot connect code ---
const dots = [];
for (let i = 0; i < 80; i++) {
  dots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8
  });
}

// ... drawDots(), drawLines(), animate(), etc.

  // ===== Helpers =====
  const inBounds = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;
  const neighbors = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

  function seedGrid() {
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => COLORS[(Math.random() * COLORS.length) | 0])
    );
  }

  function sizeBoard() {
    // Square board that fits well; fall back to CSS @media for mobile
    const size = Math.min(560, Math.max(340, Math.floor(window.innerWidth * 0.6)));
    boardEl.style.width = size + "px";
    boardEl.style.height = size + "px";
    const cell = size / cols;
    boardEl.style.setProperty("--cell", `${cell}px`);

    // position the canvas
    pathCanvas.width = size;
    pathCanvas.height = size;
  }

  function cellToPixels(r, c) {
    const cell = parseFloat(getComputedStyle(boardEl).getPropertyValue("--cell"));
    return { x: c * cell + cell / 2, y: r * cell + cell / 2 };
  }

  function render() {
    // clear board children (cells will be rebuilt)
    boardEl.querySelectorAll(".cell").forEach(n => n.remove());

    const cell = parseFloat(getComputedStyle(boardEl).getPropertyValue("--cell"));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = grid[r][c];
        if (!color) continue;
        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.style.left = c * cell + "px";
        cellEl.style.top  = r * cell + "px";
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.color = color;

        // mark selected ones
        if (path.find(p => p.r === r && p.c === c)) dot.classList.add("selected");

        cellEl.appendChild(dot);
        boardEl.appendChild(cellEl);
      }
    }
    redrawPath();
  }

  function redrawPath() {
    pCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
    if (path.length < 2) return;
    pCtx.lineWidth = Math.max(6, Math.floor(pathCanvas.width / cols * 0.18));
    pCtx.lineCap = "round";
    pCtx.shadowBlur = 12;
    pCtx.strokeStyle = allowColor || "#fff";
    pCtx.shadowColor = allowColor || "#fff";

    pCtx.beginPath();
    const first = cellToPixels(path[0].r, path[0].c);
    pCtx.moveTo(first.x, first.y);
    for (let i = 1; i < path.length; i++) {
      const pt = cellToPixels(path[i].r, path[i].c);
      pCtx.lineTo(pt.x, pt.y);
    }
    pCtx.stroke();
  }

  function startDrag(r, c) {
    if (!inBounds(r, c) || !grid[r][c]) return;
    dragging = true;
    allowColor = grid[r][c];
    path = [{ r, c, color: allowColor }];
    render();
  }

  function extendPath(r, c) {
    if (!dragging) return;
    if (!inBounds(r, c)) return;
    const color = grid[r][c];
    if (color !== allowColor) return;

    const last = path[path.length - 1];
    // backtrack one step
    if (path.length >= 2 && r === path[path.length - 2].r && c === path[path.length - 2].c) {
      path.pop();
      render();
      return;
    }
    // ignore if already in path (no squares rule for simplicity)
    if (path.some(p => p.r === r && p.c === c)) return;
    if (!neighbors(last, { r, c })) return;

    path.push({ r, c, color });
    render();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;

    if (path.length >= 3) {
      // clear selected
      const cells = new Set(path.map(p => `${p.r},${p.c}`));
      // Animate dots (fade out)
      boardEl.querySelectorAll(".cell").forEach(cellEl => {
        const r = +cellEl.dataset.r, c = +cellEl.dataset.c;
        if (cells.has(`${r},${c}`)) {
          const dot = cellEl.firstChild;
          dot.classList.add("clearing");
        }
      });

      // scoring
      const gained = SCORE_RULE(path.length);
      score += gained;
      scoreEl.textContent = score;

      // apply clear after short delay to show animation
      setTimeout(() => {
        path.forEach(({ r, c }) => (grid[r][c] = null));
        collapseAndRefill();
        moves = Math.max(0, moves - 1);
        movesEl.textContent = moves;

        // best tracking
        if (score > best) {
          best = score;
          localStorage.setItem("mindorbit_best", best);
          bestEl.textContent = best;
        }
        path = [];
        allowColor = null;
        render();
      }, 120);
    } else {
      // not enough: just reset path, no move consumed
      path = [];
      allowColor = null;
      render();
    }
  }

  function collapseAndRefill() {
    // for each column, slide down non-null and add new at top
    for (let c = 0; c < cols; c++) {
      const stack = [];
      for (let r = rows - 1; r >= 0; r--) {
        if (grid[r][c]) stack.push(grid[r][c]);
      }
      let r = rows - 1;
      while (stack.length) grid[r--][c] = stack.shift();
      while (r >= 0) {
        grid[r--][c] = COLORS[(Math.random() * COLORS.length) | 0];
      }
    }
  }

  // ===== Event Binding on board =====
  function eventToCell(e) {
    const rect = boardEl.getBoundingClientRect();
    const cellSize = rect.width / cols;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);
    return { r: y, c: x };
  }

  boardEl.addEventListener("mousedown", e => {
    const { r, c } = eventToCell(e);
    startDrag(r, c);
  });
  boardEl.addEventListener("mousemove", e => {
    if (!dragging) return;
    const { r, c } = eventToCell(e);
    extendPath(r, c);
  });
  window.addEventListener("mouseup", endDrag);

  // Touch
  boardEl.addEventListener("touchstart", e => {
    const { r, c } = eventToCell(e);
    startDrag(r, c);
  }, { passive: false });
  boardEl.addEventListener("touchmove", e => {
    e.preventDefault();
    const { r, c } = eventToCell(e);
    extendPath(r, c);
  }, { passive: false });
  window.addEventListener("touchend", endDrag);

  // ===== UI Controls =====
  gridSel.addEventListener("change", () => {
    const v = parseInt(gridSel.value, 10);
    rows = v; cols = v;
    newGame();
  });
  newBtn.addEventListener("click", newGame);

  function newGame() {
    score = 0;
    moves = START_MOVES;
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    bestEl.textContent = best;
    sizeBoard();
    seedGrid();
    render();
  }

  // Resize handling
  window.addEventListener("resize", () => {
    sizeBoard();
    render();
  });

  // Boot
  newGame();
})();
