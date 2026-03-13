import {
  LEVELS,
  createGameState,
  getBoardRows,
  movePlayer,
  nextLevelState
} from "./gameLogic.mjs";

const copy = {
  mouse: {
    name: "小老鼠米米",
    emoji: "🐭",
    intro: "幫米米避開噴水陷阱，找到香噴噴出口！",
    goal: "起司出口"
  },
  bear: {
    name: "小熊波波",
    emoji: "🐻",
    intro: "幫波波笑著衝過迷宮，去找蜂蜜終點！",
    goal: "蜂蜜出口"
  }
};

let state = createGameState(0, "mouse");
let splashOverlayTimer = null;
let audioCtx = null;
let musicEnabled = false;
let musicLoopTimer = null;

const levelNameEl = document.getElementById("levelName");
const messageEl = document.getElementById("message");
const boardEl = document.getElementById("board");
const stepsEl = document.getElementById("steps");
const splashEl = document.getElementById("splashCount");
const heroNameEl = document.getElementById("heroName");
const heroIntroEl = document.getElementById("heroIntro");
const resultEl = document.getElementById("result");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const resetBtn = document.getElementById("resetBtn");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const characterButtons = [...document.querySelectorAll("[data-character]")];
const controlButtons = [...document.querySelectorAll("[data-dir]")];

function render() {
  const hero = copy[state.character];
  const rows = getBoardRows(state.levelIndex);
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--cols", rows[0].length);

  rows.forEach((row, rowIndex) => {
    [...row].forEach((tile, colIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      const isPlayer = state.position.row === rowIndex && state.position.col === colIndex;

      if (tile === "#") {
        cell.classList.add("wall");
        cell.textContent = "🌳";
      } else if (tile === "G") {
        cell.classList.add("goal");
        cell.textContent = state.character === "mouse" ? "🧀" : "🍯";
      } else if (tile === "T") {
        cell.classList.add("trap");
        cell.textContent = "💦";
      } else if (tile === "S") {
        cell.classList.add("start");
        cell.textContent = "🏁";
      } else {
        cell.classList.add("path");
        cell.textContent = "·";
      }

      if (isPlayer) {
        cell.classList.add("player");
        cell.textContent = hero.emoji;
      }

      boardEl.appendChild(cell);
    });
  });

  levelNameEl.textContent = `${LEVELS[state.levelIndex].name} · ${state.levelIndex + 1}/${LEVELS.length}`;
  messageEl.textContent = state.message;
  heroNameEl.textContent = hero.name;
  heroIntroEl.textContent = `${hero.intro} 目標：${hero.goal}`;
  stepsEl.textContent = state.steps;
  splashEl.textContent = state.splashCount;
  resultEl.textContent = state.rescued ? "哈哈，成功逃出迷宮！" : "繼續前進，別被噴濕！";
  nextLevelBtn.disabled = !state.rescued;
  musicToggleBtn.textContent = musicEnabled ? "關閉背景音效" : "開啟背景音效";

  characterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.character === state.character);
  });
}

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function stopBackgroundMusic() {
  window.clearTimeout(musicLoopTimer);
  musicLoopTimer = null;
  if (audioCtx && audioCtx.state === "running") {
    audioCtx.suspend();
  }
}

function playMusicPhrase() {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.gain.value = 0.025;
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.0, 329.63];

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    osc.connect(gain);
    const start = now + index * 0.55;
    const stop = start + 0.5;
    osc.start(start);
    osc.stop(stop);
  });
}

function startBackgroundMusic() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  window.clearTimeout(musicLoopTimer);
  playMusicPhrase();
  musicLoopTimer = window.setTimeout(() => {
    if (musicEnabled) {
      startBackgroundMusic();
    }
  }, 2100);
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
  render();
}

function splashBoard() {
  boardEl.classList.add("splashed");
  window.clearTimeout(splashOverlayTimer);
  splashOverlayTimer = window.setTimeout(() => {
    boardEl.classList.remove("splashed");
  }, 650);
}

function step(direction) {
  const result = movePlayer(state, direction);
  state = result.state;
  if (result.event === "trap") {
    splashBoard();
  }
  render();
}

function restartLevel() {
  state = createGameState(state.levelIndex, state.character);
  render();
}

function chooseCharacter(character) {
  state = createGameState(0, character);
  render();
}

controlButtons.forEach((button) => {
  button.addEventListener("click", () => step(button.dataset.dir));
});

characterButtons.forEach((button) => {
  button.addEventListener("click", () => chooseCharacter(button.dataset.character));
});

nextLevelBtn.addEventListener("click", () => {
  state = nextLevelState(state);
  render();
});

resetBtn.addEventListener("click", restartLevel);
musicToggleBtn.addEventListener("click", toggleMusic);

window.addEventListener("keydown", (event) => {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };
  const direction = map[event.key];
  if (!direction) return;
  event.preventDefault();
  step(direction);
});

render();
