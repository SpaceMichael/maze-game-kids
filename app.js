import {
  LEVELS,
  createGameState,
  getBoardRows,
  movePlayer,
  nextLevelState
} from "./gameLogic.mjs";

const levelNames = {
  zh: ["嘻哈花園", "噴水地道", "啫喱城堡"],
  en: ["Giggle Garden", "Splashy Tunnel", "Jelly Castle"]
};

const ui = {
  zh: {
    pageTitle: "搞笑迷宮大逃走",
    pageIntro: "適合 3-6 歲小朋友的迷宮遊戲。幫小老鼠或小熊逃出迷宮，小心路上的噴水陷阱，一被噴中就會「哈哈哈」濕身回到起點！",
    characterTitle: "選擇主角",
    characters: {
      mouse: {
        buttonName: "🐭 小老鼠米米",
        buttonDesc: "跑得快，最愛起司。",
        heroName: "小老鼠米米",
        intro: "幫米米避開噴水陷阱，找到香噴噴出口！",
        goal: "起司出口"
      },
      bear: {
        buttonName: "🐻 小熊波波",
        buttonDesc: "圓滾滾，也想安全出迷宮。",
        heroName: "小熊波波",
        intro: "幫波波笑著衝過迷宮，去找蜂蜜終點！",
        goal: "蜂蜜出口"
      }
    },
    stepsLabel: "步數",
    splashLabel: "被噴中",
    tipsTitle: "搞笑提示",
    mazeTitle: "迷宮地圖",
    controlsTitle: "移動主角",
    controlsNote: "也可以用鍵盤方向鍵操作。",
    reset: "重新開始這關",
    nextLevel: "下一關",
    musicOn: "開啟背景音效",
    musicOff: "關閉背景音效",
    legendWall: "🌳 牆",
    legendTrap: "💦 陷阱",
    legendStart: "🏁 起點",
    legendGoal: "🧀/🍯 出口",
    boardLabel: "迷宮",
    messages: {
      start: "準備好了嗎？笑住出發！",
      moved: "繼續前進，出口就在附近！",
      blocked: "哎呀，撞到牆了，轉個方向吧！",
      trap: "Splash！被噴到全身濕晒，回起點再來！",
      win: "哈哈，成功逃出迷宮！",
      next: "新迷宮來了，出發！",
      restart: "重新來過，小心不要踩到水陷阱！"
    },
    resultIdle: "繼續前進，別被噴濕！",
    resultWin: "哈哈，成功逃出迷宮！",
    goalPrefix: "目標：",
    levelCounter: "第 {current} / {total} 關"
  },
  en: {
    pageTitle: "Funny Maze Escape",
    pageIntro: "A silly maze game for kids aged 3-6. Help the little mouse or little bear escape, and watch out for splashy water traps that send them giggling back to the start!",
    characterTitle: "Choose a Hero",
    characters: {
      mouse: {
        buttonName: "🐭 Mimi the Mouse",
        buttonDesc: "Fast feet and a big love for cheese.",
        heroName: "Mimi the Mouse",
        intro: "Help Mimi dodge splash traps and reach the yummy exit!",
        goal: "cheese exit"
      },
      bear: {
        buttonName: "🐻 Bobo the Bear",
        buttonDesc: "Round and cuddly, ready to escape safely.",
        heroName: "Bobo the Bear",
        intro: "Help Bobo laugh through the maze and find the honey goal!",
        goal: "honey exit"
      }
    },
    stepsLabel: "Steps",
    splashLabel: "Splashes",
    tipsTitle: "Funny Tips",
    mazeTitle: "Maze Map",
    controlsTitle: "Move the Hero",
    controlsNote: "You can also use the arrow keys on a keyboard.",
    reset: "Restart Level",
    nextLevel: "Next Level",
    musicOn: "Turn On Music",
    musicOff: "Turn Off Music",
    legendWall: "🌳 Wall",
    legendTrap: "💦 Trap",
    legendStart: "🏁 Start",
    legendGoal: "🧀/🍯 Goal",
    boardLabel: "maze",
    messages: {
      start: "Ready? Let the silly escape begin!",
      moved: "Keep going. The exit is nearby!",
      blocked: "Boing! That wall says no way.",
      trap: "Splash! The water trap sent you back to start.",
      win: "Hooray! You escaped the maze!",
      next: "A new maze is ready. Let's go!",
      restart: "Fresh start! Try to stay dry this time."
    },
    resultIdle: "Keep moving and stay dry!",
    resultWin: "Hooray! You escaped the maze!",
    goalPrefix: "Goal: ",
    levelCounter: "Level {current} / {total}"
  }
};

let lang = "zh";
let state = createGameState(0, "mouse");
let splashOverlayTimer = null;
let audioCtx = null;
let musicEnabled = false;
let musicLoopTimer = null;
let currentEvent = "start";

const pageTitleEl = document.getElementById("pageTitle");
const pageIntroEl = document.getElementById("pageIntro");
const characterTitleEl = document.getElementById("characterTitle");
const mouseNameEl = document.getElementById("mouseName");
const mouseDescEl = document.getElementById("mouseDesc");
const bearNameEl = document.getElementById("bearName");
const bearDescEl = document.getElementById("bearDesc");
const stepsLabelEl = document.getElementById("stepsLabel");
const splashLabelEl = document.getElementById("splashLabel");
const tipsTitleEl = document.getElementById("tipsTitle");
const mazeTitleEl = document.getElementById("mazeTitle");
const controlsTitleEl = document.getElementById("controlsTitle");
const controlsNoteEl = document.getElementById("controlsNote");
const legendWallEl = document.getElementById("legendWall");
const legendTrapEl = document.getElementById("legendTrap");
const legendStartEl = document.getElementById("legendStart");
const legendGoalEl = document.getElementById("legendGoal");
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
const langZhBtn = document.getElementById("langZhBtn");
const langEnBtn = document.getElementById("langEnBtn");
const characterButtons = [...document.querySelectorAll("[data-character]")];
const controlButtons = [...document.querySelectorAll("[data-dir]")];

function format(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
}

function getCopy() {
  return ui[lang];
}

function renderStaticText() {
  const text = getCopy();
  document.documentElement.lang = lang === "zh" ? "zh-HK" : "en";
  pageTitleEl.textContent = text.pageTitle;
  pageIntroEl.textContent = text.pageIntro;
  characterTitleEl.textContent = text.characterTitle;
  mouseNameEl.textContent = text.characters.mouse.buttonName;
  mouseDescEl.textContent = text.characters.mouse.buttonDesc;
  bearNameEl.textContent = text.characters.bear.buttonName;
  bearDescEl.textContent = text.characters.bear.buttonDesc;
  stepsLabelEl.textContent = text.stepsLabel;
  splashLabelEl.textContent = text.splashLabel;
  tipsTitleEl.textContent = text.tipsTitle;
  mazeTitleEl.textContent = text.mazeTitle;
  controlsTitleEl.textContent = text.controlsTitle;
  controlsNoteEl.textContent = text.controlsNote;
  legendWallEl.textContent = text.legendWall;
  legendTrapEl.textContent = text.legendTrap;
  legendStartEl.textContent = text.legendStart;
  legendGoalEl.textContent = text.legendGoal;
  resetBtn.textContent = text.reset;
  nextLevelBtn.textContent = text.nextLevel;
  musicToggleBtn.textContent = musicEnabled ? text.musicOff : text.musicOn;
  boardEl.setAttribute("aria-label", text.boardLabel);
  langZhBtn.classList.toggle("active", lang === "zh");
  langEnBtn.classList.toggle("active", lang === "en");
}

function renderBoard() {
  const hero = getCopy().characters[state.character];
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
        cell.textContent = hero.buttonName.split(" ")[0];
      }

      boardEl.appendChild(cell);
    });
  });
}

function renderStatus() {
  const text = getCopy();
  const hero = text.characters[state.character];
  levelNameEl.textContent = `${levelNames[lang][state.levelIndex]} · ${format(text.levelCounter, {
    current: state.levelIndex + 1,
    total: LEVELS.length
  })}`;
  heroNameEl.textContent = hero.heroName;
  heroIntroEl.textContent = `${hero.intro} ${text.goalPrefix}${hero.goal}`;
  stepsEl.textContent = state.steps;
  splashEl.textContent = state.splashCount;
  messageEl.textContent = text.messages[currentEvent];
  resultEl.textContent = state.rescued ? text.resultWin : text.resultIdle;
  nextLevelBtn.disabled = !state.rescued;

  characterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.character === state.character);
  });
}

function render() {
  renderStaticText();
  renderBoard();
  renderStatus();
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
  currentEvent = result.event;
  if (result.event === "trap") {
    splashBoard();
  }
  render();
}

function restartLevel() {
  state = createGameState(state.levelIndex, state.character);
  currentEvent = "restart";
  render();
}

function chooseCharacter(character) {
  state = createGameState(0, character);
  currentEvent = "start";
  render();
}

function setLanguage(nextLang) {
  lang = nextLang;
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
  currentEvent = "next";
  render();
});

resetBtn.addEventListener("click", restartLevel);
musicToggleBtn.addEventListener("click", toggleMusic);
langZhBtn.addEventListener("click", () => setLanguage("zh"));
langEnBtn.addEventListener("click", () => setLanguage("en"));

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
