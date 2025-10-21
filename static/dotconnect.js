(() => {
  const COLORS = ["#00E5FF", "#FF3CF3", "#FFB300", "#7CFF8A", "#A98BFF"];
  const START_MOVES = 30;
  const SCORE_RULE = n => (n >= 3 ? (n - 2) * (n - 2) * 10 : 0);

  let rows = 8, cols = 8;
  let grid = [];
  let path = [];
  let dragging = false;
  let allowColor = null;
  let score = 0;
  let moves = START_MOVES;
  let best = Number(localStorage.getItem("mindorbit_best") || 0);

  const boardEl = document.getElementById("dotCanvas").parentElement;
  const scoreEl = document.getElementById("score");
  const movesEl = document.getElementById("moves");
  const bestEl = document.getElementById("best");
  const gridSel = document.getElementById("gridSize");
  const newBtn = document.getElementById("newGame");

  // Canvas setup for path line
  const pathCanvas = document.createElement("canvas");
  pathCanvas.id = "pathCanvas";
  pathCanvas.style.position = "absolute";
  pathCanvas.style.top = 0;
  pathCanvas.style.left = 0;
  pathCanvas.style.zIndex = 1;
  pathCanvas.style.width = "100%";
  pathCanvas.style.height = "100%";
  pathCanvas.style.pointerEvents = "none";
  boardEl.appendChild(pathCanvas);
  const pCtx = pathCanvas.getContext("2d");

  // Helpers
  const inBounds = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;
  const neighbors = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

  function seedGrid() {
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => COLORS[Math.floor(Math.random() * COLORS.length)])
    );
  }

  function sizeBoard() {
    const size = Math.min(560, Math.max(340, Math.floor(window.innerWidth * 0.8)));
    boardEl.style.width = size + "px";
    boardEl.style.height = size + "px";
    const cell = size / cols;
    boardEl.style.setProperty("--cell", cell + "px");

    const dpr = window.devicePixelRatio || 1;
    pathCanvas.width = Math.round(size * dpr);
    pathCanvas.height = Math.round(size * dpr);
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cellToPixels(r, c) {
    const cell = parseFloat(getComputedStyle(boardEl).getPropertyValue("--cell"));
    return { x: c * cell + cell / 2, y: r * cell + cell / 2 };
  }

  function render() {
    boardEl.querySelectorAll(".cell").forEach(n => n.remove());
    const cell = parseFloat(getComputedStyle(boardEl).getPropertyValue("--cell"));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = grid[r][c];
        if (!color) continue;

        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.style.left = c * cell + "px";
        cellEl.style.top = r * cell + "px";
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.backgroundColor = color;

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

    const cellSize = parseFloat(getComputedStyle(boardEl).getPropertyValue("--cell"));
    pCtx.lineWidth = Math.max(6, Math.floor(cellSize * 0.18));
    pCtx.lineCap = "round";
    pCtx.shadowBlur = 12;
    pCtx.strokeStyle = allowColor || (path[0] && path[0].color) || "#fff";
    pCtx.shadowColor = pCtx.strokeStyle;

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
    if (!dragging || !inBounds(r, c)) return;
    const color = grid[r][c];
    if (color !== allowColor) return;

    const last = path[path.length - 1];

    // Undo move
    if (path.length >= 2 && r === path[path.length - 2].r && c === path[path.length - 2].c) {
      path.pop();
      render();
      return;
    }

    // Prevent non-neighbor jumps
    if (!neighbors(last, { r, c })) return;

    // Prevent duplicate cell usage
    if (path.some(p => p.r === r && p.c === c)) return;

    path.push({ r, c, color });
    render();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;

    if (path.length >= 3) {
      const gained = SCORE_RULE(path.length);
      score += gained;
      scoreEl.textContent = score;

      // Clear matched dots
      path.forEach(({ r, c }) => (grid[r][c] = null));
      collapseAndRefill();

      moves = Math.max(0, moves - 1);
      movesEl.textContent = moves;

      if (score > best) {
        best = score;
        localStorage.setItem("mindorbit_best", best);
        bestEl.textContent = best;
      }
    }

    path = [];
    allowColor = null;
    render();
  }

  function collapseAndRefill() {
    for (let c = 0; c < cols; c++) {
      const stack = [];
      for (let r = rows - 1; r >= 0; r--) {
        if (grid[r][c]) stack.push(grid[r][c]);
      }
      for (let r = rows - 1; r >= 0; r--) {
        grid[r][c] = stack.pop() || COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }
  }

  function eventToCell(e) {
    const rect = boardEl.getBoundingClientRect();
    const cellSize = rect.width / cols;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);
    return { r: y, c: x };
  }

  // Mouse & Touch Events
  boardEl.addEventListener("mousedown", e => {
    const { r, c } = eventToCell(e);
    startDrag(r, c);
  });
  boardEl.addEventListener("mousemove", e => {
    if (dragging) {
      const { r, c } = eventToCell(e);
      extendPath(r, c);
    }
  });
  window.addEventListener("mouseup", endDrag);

  boardEl.addEventListener("touchstart", e => {
    e.preventDefault();
    const { r, c } = eventToCell(e);
    startDrag(r, c);
  }, { passive: false });
  boardEl.addEventListener("touchmove", e => {
    e.preventDefault();
    if (dragging) {
      const { r, c } = eventToCell(e);
      extendPath(r, c);
    }
  }, { passive: false });
  window.addEventListener("touchend", e => {
    e.preventDefault();
    endDrag();
  }, { passive: false });

  gridSel.addEventListener("change", () => {
    rows = cols = parseInt(gridSel.value, 10);
    newGame();
  });
  newBtn.addEventListener("click", newGame);

  function newGame() {
    score = 0;
    moves = START_MOVES;
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    bestEl.textContent = best;
    seedGrid();
    sizeBoard();
    render();
  }

  window.addEventListener("resize", () => {
    sizeBoard();
    render();
  });
  window.addEventListener("load", newGame);
})();

