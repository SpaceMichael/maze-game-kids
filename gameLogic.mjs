export const DIRECTION_DELTAS = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

const MIN_SIZE = 7;
const MAX_SIZE = 17;

export const DIFFICULTY_SETTINGS = {
  easy: { stageOffset: 0, trapMultiplier: 0.75 },
  normal: { stageOffset: 1, trapMultiplier: 1 },
  hard: { stageOffset: 2, trapMultiplier: 1.35 }
};

function clonePosition(position) {
  return { row: position.row, col: position.col };
}

function createWallGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill("#"));
}

function shuffle(items, random = Math.random) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
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

function sizeForStage(stage) {
  return Math.min(MIN_SIZE + stage * 2, MAX_SIZE);
}

function resolveDifficulty(difficultyKey = "normal") {
  return DIFFICULTY_SETTINGS[difficultyKey] || DIFFICULTY_SETTINGS.normal;
}

function findMarker(rows, marker) {
  for (let row = 0; row < rows.length; row += 1) {
    const col = rows[row].indexOf(marker);
    if (col !== -1) return { row, col };
  }
  throw new Error(`Marker ${marker} not found`);
}

function listPathCells(rows) {
  const cells = [];
  rows.forEach((row, rowIndex) => {
    [...row].forEach((tile, colIndex) => {
      if (tile !== "#") {
        cells.push({ row: rowIndex, col: colIndex, tile });
      }
    });
  });
  return cells;
}

export function generateMazeLevel(stage = 0, random = Math.random, difficultyKey = "normal") {
  const difficulty = resolveDifficulty(difficultyKey);
  const size = sizeForStage(stage + difficulty.stageOffset);
  const grid = createWallGrid(size);
  const stack = [{ row: 1, col: 1 }];

  grid[1][1] = ".";

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const directions = shuffle(
      [
        { row: -2, col: 0 },
        { row: 2, col: 0 },
        { row: 0, col: -2 },
        { row: 0, col: 2 }
      ],
      random
    );

    const next = directions.find((direction) => {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;
      return (
        nextRow > 0 &&
        nextRow < size - 1 &&
        nextCol > 0 &&
        nextCol < size - 1 &&
        grid[nextRow][nextCol] === "#"
      );
    });

    if (!next) {
      stack.pop();
      continue;
    }

    const wallRow = current.row + next.row / 2;
    const wallCol = current.col + next.col / 2;
    const nextRow = current.row + next.row;
    const nextCol = current.col + next.col;

    grid[wallRow][wallCol] = ".";
    grid[nextRow][nextCol] = ".";
    stack.push({ row: nextRow, col: nextCol });
  }

  grid[1][1] = "S";
  grid[size - 2][size - 2] = "G";

  const rows = grid.map((row) => row.join(""));
  const floorCells = listPathCells(rows).filter(({ tile, row, col }) => {
    return tile === "." && !(row === 1 && col === 1) && !(row === size - 2 && col === size - 2);
  });

  const baseTrapCount = Math.max(1, Math.floor(stage / 2) + 1);
  const trapCount = Math.min(
    Math.max(1, Math.round(baseTrapCount * difficulty.trapMultiplier)),
    Math.max(1, Math.floor(floorCells.length / 8))
  );
  shuffle(floorCells, random)
    .slice(0, trapCount)
    .forEach(({ row, col }) => {
      grid[row][col] = "T";
    });

  const finalRows = grid.map((row) => row.join(""));
  return {
    size,
    rows: finalRows,
    start: { row: 1, col: 1 },
    goal: { row: size - 2, col: size - 2 }
  };
}

export function createGameState(stage = 0, character = "mouse", options = {}) {
  const difficultyKey = options.difficultyKey || "normal";
  const level = options.rows
    ? {
        rows: options.rows,
        start: findMarker(options.rows, "S"),
        goal: findMarker(options.rows, "G"),
        size: options.rows.length
      }
    : generateMazeLevel(stage, options.random, difficultyKey);

  return {
    levelIndex: stage,
    difficultyKey,
    character,
    rows: level.rows,
    size: level.size,
    position: clonePosition(level.start),
    start: clonePosition(level.start),
    goal: clonePosition(level.goal),
    rescued: false,
    splashCount: 0,
    steps: 0
  };
}

export function getBoardRows(state) {
  return state.rows;
}

export function getTileForState(state, position = state.position) {
  return readTile(state.rows, position);
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
    return { state, event: "blocked" };
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
        splashCount: state.splashCount + 1
      },
      event: "trap"
    };
  }

  if (tile === "G") {
    return {
      state: {
        ...movedState,
        rescued: true
      },
      event: "win"
    };
  }

  return {
    state: movedState,
    event: "moved"
  };
}

export function nextLevelState(state) {
  return createGameState(state.levelIndex + 1, state.character, {
    difficultyKey: state.difficultyKey
  });
}
