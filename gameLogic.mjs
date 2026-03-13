export const LEVELS = [
  {
    name: "Giggle Garden",
    rows: [
      "#######",
      "#S...T#",
      "#.#.#.#",
      "#.#...#",
      "#.###.#",
      "#....G#",
      "#######"
    ]
  },
  {
    name: "Splashy Tunnel",
    rows: [
      "########",
      "#S..#..#",
      "#.#.#T.#",
      "#.#...##",
      "#.###..#",
      "#...#G.#",
      "########"
    ]
  },
  {
    name: "Jelly Castle",
    rows: [
      "#########",
      "#S....#G#",
      "#.###.#.#",
      "#...#...#",
      "###.#.###",
      "#T..#...#",
      "#########"
    ]
  }
];

export const DIRECTION_DELTAS = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

function clonePosition(position) {
  return { row: position.row, col: position.col };
}

function findMarker(rows, marker) {
  for (let row = 0; row < rows.length; row += 1) {
    const col = rows[row].indexOf(marker);
    if (col !== -1) return { row, col };
  }
  throw new Error(`Marker ${marker} not found`);
}

function readTile(rows, position) {
  if (
    position.row < 0 ||
    position.row >= rows.length ||
    position.col < 0 ||
    position.col >= rows[0].length
  ) {
    return "#";
  }
  return rows[position.row][position.col];
}

export function createGameState(levelIndex = 0, character = "mouse") {
  const level = LEVELS[levelIndex];
  if (!level) throw new Error(`Unknown level index: ${levelIndex}`);

  const start = findMarker(level.rows, "S");
  return {
    levelIndex,
    character,
    position: clonePosition(start),
    start,
    rescued: false,
    splashCount: 0,
    steps: 0,
    message: "Start the maze adventure!"
  };
}

export function getTileForState(state, position = state.position) {
  return readTile(LEVELS[state.levelIndex].rows, position);
}

export function movePlayer(state, direction) {
  const delta = DIRECTION_DELTAS[direction];
  if (!delta) throw new Error(`Unknown direction: ${direction}`);

  if (state.rescued) {
    return { state, event: "finished" };
  }

  const nextPosition = {
    row: state.position.row + delta.row,
    col: state.position.col + delta.col
  };

  const tile = getTileForState(state, nextPosition);
  if (tile === "#") {
    return {
      state: {
        ...state,
        message: "Bonk! That wall is too bouncy."
      },
      event: "blocked"
    };
  }

  const movedState = {
    ...state,
    position: nextPosition,
    steps: state.steps + 1
  };

  if (tile === "T") {
    return {
      state: {
        ...movedState,
        position: clonePosition(state.start),
        splashCount: state.splashCount + 1,
        message: "Splash! A silly water trap sent you back to start."
      },
      event: "trap"
    };
  }

  if (tile === "G") {
    return {
      state: {
        ...movedState,
        rescued: true,
        message: "Yay! You found the funny maze exit."
      },
      event: "win"
    };
  }

  return {
    state: {
      ...movedState,
      message: "Keep going. The exit is near!"
    },
    event: "moved"
  };
}

export function nextLevelState(state) {
  const nextIndex = (state.levelIndex + 1) % LEVELS.length;
  return createGameState(nextIndex, state.character);
}

export function getBoardRows(levelIndex) {
  const level = LEVELS[levelIndex];
  if (!level) throw new Error(`Unknown level index: ${levelIndex}`);
  return level.rows;
}
