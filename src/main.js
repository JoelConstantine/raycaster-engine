import { render, setDisplay } from "./render.js";
import { initControls, PLAYER_ACTIONS } from "./controls.js";

// prettier-ignore
const map = {
  map_width: 8,
  map_height: 8,
  map_size: 64,
  layout: [
    1, 1, 1, 1, 1, 1, 1, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 1, 1, 1, 1, 1, 1, 1,
  ]
};

const updateGameState = (gameState, controls) => {
  const { player } = gameState;
  let { x, y } = player;

  const mapbounds_x = 64 * 8,
    mapbounds_y = 64 * 8;

  if (controls.forward) {
    y > 0 ? (y -= 1) : 0;
  }
  if (controls.left) {
    x > 0 ? (x -= 1) : 0;
  }
  if (controls.right) {
    x < mapbounds_x ? (x += 1) : mapbounds_x;
  }
  if (controls.down) {
    y < mapbounds_y ? (y += 1) : mapbounds_y;
  }
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

const initDisplay = () => {
  const canvas = document.getElementById("display");
  const resolution_height = 800;
  const window_ratio = window.outerWidth / window.outerHeight;

  const viewport = {
    height: resolution_height,
    width: resolution_height * window_ratio,
  };

  return {
    canvas,
    viewport,
  };
};

const initGameState = (debug = false) => {
  const player = {
    x: 16,
    y: 16,
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
    debug,
  };
};

function main() {
  const display = initDisplay();
  const gameState = initGameState(true);

  setDisplay(display.canvas);
  const controls = initControls(gameState.player, PLAYER_ACTIONS);
  requestAnimationFrame(gameLoop(display, gameState, controls, 0));

  window.onresize = () => {
    setDisplay(display.canvas);
  };
}

main();
