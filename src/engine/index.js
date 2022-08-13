import { updatePlayer } from "../player/";
import { castRays } from "../map/";

let frame1, frame2, fps;

const initGameState = (debug = false, textures, map) => {
  const player = {
    player_x: 84,
    player_y: 84,
    delta_x: Math.cos(0),
    delta_y: Math.sin(0),
    angle: 0,
    player_offset: {},
  };

  return {
    player,
    map,
    debug,
    textures,
  };
};

const _updateGameState = (gameState, controls) => {
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

const gameLoop =
  (display, gameState, controls, render) => (lastTime) => (time) => {
    let game_state = {
      ...gameState,
    };

    const seconds = (time - lastTime) / 1000;
    lastTime = time;

    if (seconds < 0.2) {
      game_state = _updateGameState(gameState, controls.getState());
      render(display, game_state);
    }
    const run_loop = gameLoop(display, game_state, controls, render, lastTime);
    requestAnimationFrame(run_loop(lastTime));
  };

export { initGameState, gameLoop };
