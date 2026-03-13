import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, generateMazeLevel, movePlayer, nextLevelState } from "./gameLogic.mjs";

function findMarker(rows, marker) {
  for (let row = 0; row < rows.length; row += 1) {
    const col = rows[row].indexOf(marker);
    if (col !== -1) return { row, col };
  }
  throw new Error(`Marker ${marker} not found`);
}

function hasPath(rows) {
  const start = findMarker(rows, "S");
  const goal = findMarker(rows, "G");
  const queue = [start];
  const seen = new Set([`${start.row},${start.col}`]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.row === goal.row && current.col === goal.col) {
      return true;
    }

    [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ].forEach((delta) => {
      const next = { row: current.row + delta.row, col: current.col + delta.col };
      if (
        next.row < 0 ||
        next.row >= rows.length ||
        next.col < 0 ||
        next.col >= rows[0].length
      ) {
        return;
      }
      if (rows[next.row][next.col] === "#") return;
      const key = `${next.row},${next.col}`;
      if (seen.has(key)) return;
      seen.add(key);
      queue.push(next);
    });
  }

  return false;
}

test("generated maze is always solvable", () => {
  for (let stage = 0; stage < 5; stage += 1) {
    const level = generateMazeLevel(stage, () => 0.42);
    assert.equal(hasPath(level.rows), true);
  }
});

test("game starts at the generated start tile", () => {
  const state = createGameState(0, "mouse");
  assert.deepEqual(state.position, state.start);
  assert.equal(state.character, "mouse");
  assert.equal(state.rows[1][1], "S");
});

test("walking into a wall keeps the same position", () => {
  const state = createGameState(0, "mouse", {
    rows: [
      "#####",
      "#S..#",
      "#####",
      "#..G#",
      "#####"
    ]
  });
  const result = movePlayer(state, "up");
  assert.equal(result.event, "blocked");
  assert.deepEqual(result.state.position, state.position);
  assert.equal(result.state.steps, state.steps);
});

test("trap sends player back to start and increments splash count", () => {
  let state = createGameState(0, "bear", {
    rows: [
      "#####",
      "#STG#",
      "#####",
      "#####",
      "#####"
    ]
  });
  const result = movePlayer(state, "right");
  assert.equal(result.event, "trap");
  assert.deepEqual(result.state.position, state.start);
  assert.equal(result.state.splashCount, 1);
});

test("goal marks state as rescued", () => {
  let state = createGameState(0, "mouse", {
    rows: [
      "#####",
      "#S.G#",
      "#####",
      "#####",
      "#####"
    ]
  });
  state = movePlayer(state, "right").state;
  state = movePlayer(state, "right").state;
  assert.equal(state.rescued, true);
});

test("next level creates a bigger maze", () => {
  const state = createGameState(0, "bear");
  const next = nextLevelState(state);
  assert.equal(next.levelIndex, 1);
  assert.equal(next.character, "bear");
  assert.equal(next.steps, 0);
  assert.equal(next.splashCount, 0);
  assert.equal(next.size > state.size, true);
});
