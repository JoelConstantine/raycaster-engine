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
    1, 0, 1, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 1, 1, 0, 1, 
    1, 0, 0, 0, 1, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 1, 1, 1, 1, 1, 1, 1,
  ]
};

const updatePlayer = (
  { player_x, player_y, delta_x, delta_y, angle },
  controls,
) => {
  const { PI } = Math;
  let x = player_x,
    y = player_y;

  const mapbounds_x = 64 * 8,
    mapbounds_y = 64 * 8;

  if (controls.forward) {
    x += delta_x;
    y += delta_y;
  }
  if (controls.left) {
    angle -= 0.01;
    if (angle < 0) {
      console.log("correcting left");
      angle += 2 * PI;
    }
    delta_x = Math.cos(angle);
    delta_y = Math.sin(angle);
  }
  if (controls.right) {
    angle += 0.01;
    if (angle > 2 * PI) {
      console.log("correcting rihgt");
      angle -= 2 * PI;
    }
    delta_x = Math.cos(angle);
    delta_y = Math.sin(angle);
  }
  if (controls.down) {
    x -= delta_x;
    y -= delta_y;
  }

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > mapbounds_x) x = mapbounds_x;
  if (y > mapbounds_y) y = mapbounds_y;

  return {
    player_x: x,
    player_y: y,
    delta_x,
    delta_y,
    angle,
  };
};

const updateGameState = (gameState, controls) => {
  const { player } = gameState;
  const player_position = updatePlayer(player, controls);
  return {
    ...gameState,
    player: {
      ...player,
      ...player_position,
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
    player_x: 64,
    player_y: 64,
    delta_x: Math.cos(0),
    delta_y: Math.sin(0),
    angle: 0,
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
  const controls = initControls(PLAYER_ACTIONS);
  requestAnimationFrame(gameLoop(display, gameState, controls, 0));

  window.onresize = () => {
    setDisplay(display.canvas);
  };
}

main();
