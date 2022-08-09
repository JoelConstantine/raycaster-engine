import { render, setDisplay } from "./render.js";
import { initControls, PLAYER_ACTIONS } from "./controls.js";

// prettier-ignore
const map = [
  1, 1, 1, 1, 1, 1, 1, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 1, 
  1, 1, 1, 1, 1, 1, 1, 1,
];

const updateGameState = (gameState, controls) => {
  const { player } = gameState;
  let { x, y } = player;
  if (controls.forward) y -= 1;
  if (controls.left) x -= 1;
  if (controls.right) x += 1;
  if (controls.down) y += 1;
  return {
    ...gameState,
    player: {
      ...player,
      x,
      y,
    },
  };
};

const gameLoop = (display, gameState, controls, lastTime) => (time) => {
  let game_state = gameState;
  const seconds = (time - lastTime) / 1000;
  lastTime = time;
  if (seconds < 0.2) {
    game_state = updateGameState(gameState, controls.getState());
    render(display, game_state);
  }

  requestAnimationFrame(gameLoop(display, game_state, controls, lastTime));
};

const initGameState = () => {
  const player = {
    x: 300,
    y: 300,
    inputs: {
      forward: false,
      backward: false,
      left: false,
      right: false,
    },
  };

  return {
    player,
    map,
  };
};

function main() {
  const display = document.getElementById("display");
  const gameState = initGameState();

  setDisplay(display);
  const controls = initControls(gameState.player, PLAYER_ACTIONS);
  requestAnimationFrame(gameLoop(display, gameState, controls, 0));
}

main();
