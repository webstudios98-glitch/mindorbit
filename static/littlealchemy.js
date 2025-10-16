(function () {
  // ==== Elements for both modes ====
  const motivationalBase = [
    "Hope", "Calm", "Breath", "Music", "Thought",
    "Play", "Nature", "Support", "Light", "Dream"
  ];

  const relaxingBase = [
    "☀️ Sun", "🌊 Water", "🌳 Tree", "🔥 Fire",
    "💨 Air", "🌧 Rain", "🌙 Moon", "🌈 Rainbow"
  ];

  // ==== Combination Rules ====
  const motivationalRules = {
    "hope+strength": "Resilience",
    "calm+breath": "Center",
    "music+thought": "Comfort",
    "play+support": "Joy",
    "nature+breath": "Grounded",
    "dream+light": "Inspiration",
    "calm+music": "Soothing",
    "thought+support": "Clarity",
    "hope+dream": "Possibility",
    "inspiration+joy": "Bloom"
  };

  const relaxingRules = {
    "☀️ sun+🌊 water": "🌈 Rainbow",
    "🌳 tree+🌧 rain": "🍃 Leaf",
    "🔥 fire+💨 air": "💥 Spark",
    "🌙 moon+☀️ sun": "🌌 Eclipse",
    "🌊 water+💨 air": "☁️ Cloud",
    "🌧 rain+☀️ sun": "🌦 Weather",
    "🌳 tree+🌙 moon": "🌲 Night Forest"
  };

  // ==== DOM Elements ====
  const baseEl = document.getElementById("baseElements");
  const workspace = document.getElementById("workspace");
  const combineBtn = document.getElementById("combineBtn");
  const clearBtn = document.getElementById("clearWorkspace");
  const discoveriesEl = document.getElementById("discoveries");
  const resetBtn = document.getElementById("resetDiscoveries");
  const modeToggle = document.getElementById("modeToggle");

  // ==== State ====
  let discovered = new Set();
  let wsItems = [];
  let currentMode = "motivational"; // default

  // ==== Helpers ====
  function pairKey(a, b) {
    return [a, b].map(x => x.toLowerCase()).sort().join("+");
  }

  function getBaseElements() {
    return currentMode === "motivational" ? motivationalBase : relaxingBase;
  }

  function getRules() {
    return currentMode === "motivational" ? motivationalRules : relaxingRules;
  }

  // ==== Render Functions ====
  function renderBase() {
    baseEl.innerHTML = "";
    getBaseElements().forEach(name => {
      const e = document.createElement("div");
      e.className = "element";
      e.textContent = name;
      e.draggable = true;
      e.addEventListener("dragstart", ev => {
        ev.dataTransfer.setData("text/plain", name);
        e.classList.add("dragging");
      });
      e.addEventListener("dragend", () => e.classList.remove("dragging"));
      e.addEventListener("click", () => addToWorkspace(name));
      baseEl.appendChild(e);
    });
  }

  function renderWorkspace() {
    workspace.innerHTML = "";
    wsItems.forEach((name, idx) => {
      const d = document.createElement("div");
      d.className = "element";
      d.textContent = name;
      d.dataset.index = idx;
      d.addEventListener("click", () => {
        d.classList.toggle("selected");
      });
      workspace.appendChild(d);
    });
  }

  function renderDiscoveries() {
    discoveriesEl.innerHTML = "";
    if (discovered.size === 0) {
      discoveriesEl.innerHTML =
        `<div style="color:#bcdfff">No discoveries yet — combine elements to reveal new ones.</div>`;
      return;
    }
    Array.from(discovered).forEach(name => {
      const e = document.createElement("div");
      e.className = "result";
      e.textContent = name;
      discoveriesEl.appendChild(e);
    });
  }

  // ==== Workspace Management ====
  function addToWorkspace(name) {
    wsItems.push(name);
    renderWorkspace();
  }

  // Drag/drop
  workspace.addEventListener("dragover", e => {
    e.preventDefault();
    workspace.classList.add("drag-over");
  });
  workspace.addEventListener("dragleave", () =>
    workspace.classList.remove("drag-over")
  );
  workspace.addEventListener("drop", e => {
    e.preventDefault();
    workspace.classList.remove("drag-over");
    const txt = e.dataTransfer.getData("text/plain");
    if (txt) addToWorkspace(txt);
  });

  // ==== Combine Logic ====
  combineBtn.addEventListener("click", () => {
    const selectedEls = Array.from(
      workspace.querySelectorAll(".element.selected")
    );
    if (selectedEls.length < 2) {
      if (wsItems.length >= 2) {
        const a = wsItems[wsItems.length - 2];
        const b = wsItems[wsItems.length - 1];
        attemptCombine(a, b);
      } else {
        alert("Place two elements in the workspace first.");
      }
      return;
    }
    const a = selectedEls[0].textContent;
    const b = selectedEls[1].textContent;
    attemptCombine(a, b);
  });

  function attemptCombine(a, b) {
    const rules = getRules();
    const key = pairKey(a, b);
    if (rules[key]) {
      const result = rules[key];
      if (!discovered.has(result)) {
        discovered.add(result);
        renderDiscoveries();
        addToWorkspace(result);
        flashElement(result);
      } else {
        addToWorkspace(result);
      }
    } else {
      flashInvalid();
    }
  }

  function flashElement(name) {
    const el = document.createElement("div");
    el.className = "result";
    el.textContent = `Discovered: ${name}`;
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "18%";
    el.style.transform = "translateX(-50%)";
    el.style.zIndex = 1200;
    document.body.appendChild(el);
    setTimeout(() => (el.style.opacity = "0"), 1400);
    setTimeout(() => el.remove(), 2000);
  }

  function flashInvalid() {
    const el = document.createElement("div");
    el.className = "result";
    el.textContent = "No result — try different elements";
    el.style.background = "linear-gradient(90deg, #ff8a8a, #ffd18a)";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "18%";
    el.style.transform = "translateX(-50%)";
    el.style.zIndex = 1200;
    document.body.appendChild(el);
    setTimeout(() => (el.style.opacity = "0"), 1200);
    setTimeout(() => el.remove(), 1600);
  }

  // ==== Clear / Reset ====
  clearBtn.addEventListener("click", () => {
    wsItems = [];
    renderWorkspace();
  });

  resetBtn.addEventListener("click", () => {
    discovered = new Set();
    renderDiscoveries();
  });

  // ==== Mode Toggle ====
  modeToggle.addEventListener("change", e => {
    currentMode = e.target.value;
    wsItems = [];
    discovered = new Set();
    renderBase();
    renderWorkspace();
    renderDiscoveries();
  });

  // ==== Init ====
  renderBase();
  renderDiscoveries();
})();
