import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, movePlayer, nextLevelState } from "./gameLogic.mjs";

test("game starts at the start tile", () => {
  const state = createGameState(0, "mouse");
  assert.deepEqual(state.position, { row: 1, col: 1 });
  assert.equal(state.character, "mouse");
});

test("walking into a wall keeps the same position", () => {
  const state = createGameState(0, "mouse");
  const result = movePlayer(state, "left");
  assert.equal(result.event, "blocked");
  assert.deepEqual(result.state.position, state.position);
  assert.equal(result.state.steps, state.steps);
});

test("trap sends player back to start and increments splash count", () => {
  let state = createGameState(0, "bear");
  state = movePlayer(state, "right").state;
  state = movePlayer(state, "right").state;
  state = movePlayer(state, "right").state;
  const result = movePlayer(state, "right");
  assert.equal(result.event, "trap");
  assert.deepEqual(result.state.position, state.start);
  assert.equal(result.state.splashCount, 1);
});

test("goal marks state as rescued", () => {
  let state = createGameState(0, "mouse");
  const path = ["right", "right", "down", "down", "right", "right", "down", "down", "right"];
  for (const step of path) {
    state = movePlayer(state, step).state;
  }
  assert.equal(state.rescued, true);
});

test("next level resets progress and advances level index", () => {
  const state = createGameState(0, "bear");
  const next = nextLevelState(state);
  assert.equal(next.levelIndex, 1);
  assert.equal(next.character, "bear");
  assert.equal(next.steps, 0);
  assert.equal(next.splashCount, 0);
});
