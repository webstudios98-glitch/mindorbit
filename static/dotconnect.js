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
  let grid = [];
  let score = 0;
  let moves = START_MOVES;
  let best = Number(localStorage.getItem("mindorbit_best") || 0);

  let path = [];
  let dragging = false;
  let allowColor = null;

  // ===== DOM =====
  const boardEl = document.getElementById("board");
  boardEl.style.touchAction = "none"; // ✅ fixed typo (El not E1)
  const scoreEl = document.getElementById("score");
  const movesEl = document.getElementById("moves");
  const bestEl  = document.getElementById("best");
  const gridSel = document.getElementById("gridSize");
  const newBtn  = document.getElementById("newGame");

  // Canvas for connection lines
  const pathCanvas = document.createElement("canvas");
  pathCanvas.id = "pathCanvas";
  pathCanvas.style.position = "absolute";
  pathCanvas.style.top = 0;
  pathCanvas.style.left = 0;
  pathCanvas.style.zIndex = 1;
  const pCtx = pathCanvas.getContext("2d");
  boardEl.appendChild(pathCanvas);

  // ===== Helpers =====
  const inBounds = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols;
  const neighbors = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

  function seedGrid() {
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => COLORS[(Math.random() * COLORS.length) | 0])
    );
  }

  function sizeBoard() {
    const size = Math.min(560, Math.max(340, Math.floor(window.innerWidth * 0.6)));
    boardEl.style.width = size + "px";
    boardEl.style.height = size + "px";
    const cell = size / cols;
    boardEl.style.setProperty("--cell", cell + "px");

    // High-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    pathCanvas.style.width = size + "px";
    pathCanvas.style.height = size + "px";
    pathCanvas.width = Math.round(size * dpr);
    pathCanvas.height = Math.round(size * dpr);
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pCtx.clearRect(0, 0, size, size);
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
        cellEl.style.top  = r * cell + "px";
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
    if (path.length >= 2 && r === path[path.length - 2].r && c === path[path.length - 2].c) {
      path.pop();
      render();
      return;
    }
    if (path.some(p => p.r === r && p.c === c)) return;
    if (!neighbors(last, { r, c })) return;

    path.push({ r, c, color });
    render();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;

    if (path.length >= 3) {
      const cells = new Set(path.map(p => '${p.r},${p.c}')); // ✅ fixed template string
      boardEl.querySelectorAll(".cell").forEach(cellEl => {
        const r = +cellEl.dataset.r, c = +cellEl.dataset.c;
        if (cells.has('${r},${c}')) {
          const dot = cellEl.firstChild;
          if (dot) dot.classList.add("clearing");
        }
      });

      const gained = SCORE_RULE(path.length);
      score += gained;
      scoreEl.textContent = score;

      setTimeout(() => {
        path.forEach(({ r, c }) => (grid[r][c] = null));
        collapseAndRefill();
        moves = Math.max(0, moves - 1);
        movesEl.textContent = moves;

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
      path = [];
      allowColor = null;
      render();
    }
  }

  function collapseAndRefill() {
    for (let c = 0; c < cols; c++) {
      const stack = [];
      for (let r = rows - 1; r >= 0; r--) {
        if (grid[r][c]) stack.push(grid[r][c]);
      }
      let r = rows - 1;
      while (stack.length) grid[r--][c] = stack.shift();
      while (r >= 0) grid[r--][c] = COLORS[(Math.random() * COLORS.length) | 0];
    }
  }

  // ===== Events =====
  function eventToCell(e) {
    const rect = boardEl.getBoundingClientRect();
    const cellSize = rect.width / cols;
    let clientX, clientY;
    if (e.touches?.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);
    return { r: y, c: x };
  }

  boardEl.addEventListener("mousedown", e => startDrag(...Object.values(eventToCell(e))));
  boardEl.addEventListener("mousemove", e => dragging && extendPath(...Object.values(eventToCell(e))));
  window.addEventListener("mouseup", endDrag);

  boardEl.addEventListener("touchstart", e => {
    e.preventDefault();
    startDrag(...Object.values(eventToCell(e)));
  }, { passive: false });

  boardEl.addEventListener("touchmove", e => {
    e.preventDefault();
    extendPath(...Object.values(eventToCell(e)));
  }, { passive: false });

  window.addEventListener("touchend", endDrag);

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

  window.addEventListener("resize", () => {
    sizeBoard();
    render();
  });

  // Boot
  newGame();
})();
