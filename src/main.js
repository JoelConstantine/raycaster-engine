import { render, setDisplay } from "./render.js";
import { initControls, PLAYER_ACTIONS } from "./controls.js";
import { castRays } from "./map.js";

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

let frame1, frame2, fps;

const updatePlayer = ({ player, map, fps }, controls) => {
  const { forward, backward, left, right, strafe_left, strafe_right } =
    controls;
  let { player_x, player_y, delta_x, delta_y, angle } = player;
  const { layout, map_width } = map;
  const { PI } = Math;
  let x = player_x,
    y = player_y;

  // set an offset
  const player_offset = {
    x: delta_x < 0 ? -20 : 20,
    y: delta_y < 0 ? -20 : 20,
  };

  // frame2 = Date.now();
  // fps = (frame2 - frame1) / 2;
  // frame1 = Date.now();

  const mapbounds_x = 64 * 8,
    mapbounds_y = 64 * 8;

  const player_position_start = {
    x: parseInt(x / 64),
    y: parseInt(y / 64),
    x_add: parseInt((x + player_offset.x) / 64),
    y_add: parseInt((y + player_offset.y) / 64),
    x_sub: parseInt((x - player_offset.x) / 64),
    y_sub: parseInt((y - player_offset.y) / 64),
  };

  // control moving forward and backwards
  if (forward) {
    const pos_y = player_position_start.y * map_width;
    const offset_y = player_position_start.y_add * map_width;
    const idx = pos_y + player_position_start.x_add;
    const idy = offset_y + player_position_start.x;

    x += layout[parseInt(idx)] === 0 ? delta_x * fps : 0;
    y += layout[parseInt(idy)] === 0 ? delta_y * fps : 0;
  }
  if (backward) {
    const pos_y = player_position_start.y * map_width;
    const offset_y = player_position_start.x_sub * map_width;
    const idx = pos_y + player_position_start.x_sub;
    const idy = offset_y + player_position_start.y;

    x -= layout[parseInt(idx)] === 0 ? delta_x * fps : 0;
    y -= layout[parseInt(idy)] === 0 ? delta_y * fps : 0;
  }
  if (strafe_left) {
    // TODO: Check where the player is strafing too for movement
    const new_angle = angle - PI / 2;

    const strafe_delta_x = Math.cos(new_angle);
    const strafe_delta_y = Math.sin(new_angle);
    x += strafe_delta_x;
    y += strafe_delta_y;
  }
  if (strafe_right) {
    // TODO: Check where the player is strafing too for movement
    const new_angle = angle + PI / 2;

    const strafe_delta_x = Math.cos(new_angle);
    const strafe_delta_y = Math.sin(new_angle);
    x += strafe_delta_x;
    y += strafe_delta_y;
  }

  // control turning left and right
  if (left) {
    angle -= 0.01 * fps;
    if (angle < 0) {
      angle += 2 * PI;
    }
    delta_x = Math.cos(angle);
    delta_y = Math.sin(angle);
  }
  if (right) {
    angle += 0.01 * fps;
    if (angle > 2 * PI) {
      angle -= 2 * PI;
    }
    delta_x = Math.cos(angle);
    delta_y = Math.sin(angle);
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
    player_offset,
  };
};

const updateGameState = (gameState, controls) => {
  const { paused } = controls;
  if (paused) return { ...gameState, paused };

  const { player, map } = gameState;

  frame2 = Date.now();
  fps = (frame2 - frame1) / 2;
  frame1 = Date.now();

  if (fps > 4) fps = 4;

  const player_position = updatePlayer(gameState, controls);

  const rays = castRays(player, map);

  return {
    ...gameState,
    fps,
    player: {
      ...player,
      ...player_position,
    },
    paused,
    rays,
  };
};

const gameLoop = (display, gameState, controls, lastTime) => (time) => {
  let game_state = {
    ...gameState,
  };

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
  const resolution_height = window.innerHeight;
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
    player_offset: {},
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
  //const controls = initControls(PLAYER_ACTIONS);
  const controls = initControls(PLAYER_ACTIONS);
  requestAnimationFrame(gameLoop(display, gameState, controls, 0));

  window.onresize = () => {
    setDisplay(display.canvas);
  };
}

main();
