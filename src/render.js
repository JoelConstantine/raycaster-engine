const colors = {
  MAP_BACKGROUND: "rgb(0,0,0)",
  PLAYER_COLOR: "rgb(232,17,64)",
  WALL_COLOR: "rgb(255,255,255)",
  VIEWPORT: "rgb(125,125,125)",
};

function _drawPlayer(context, { x, y }, scale) {
  context.fillStyle = colors.PLAYER_COLOR;
  context.fillRect(x, y, 1 * scale, 1 * scale);
}

function _drawBackground(context, { width, height }) {
  context.fillStyle = "rgb(0,0,0)";
  context.fillRect(0, 0, width, height);
}

const _draw2dMap = (
  context,
  { map_width, map_height, map_size, layout },
  player,
  { x, y },
) => {
  const window_size = map_size * map_width;
  context.fillStyle = colors.MAP_BACKGROUND;
  context.fillRect(x, y, window_size + map_width, window_size + map_height);

  for (let row = 0; row < map_width; row++) {
    for (let col = 0; col < map_height; col++) {
      const wall_index = row * 8 + col;
      if (layout[wall_index]) {
        const fill_style = colors.WALL_COLOR;

        context.fillStyle = fill_style;
        context.fillRect(
          (x + map_size + 1) * col,
          (y + map_size + 1) * row,
          map_size,
          map_size,
        );
      }
    }
  }

  const scaled_player = {
    ...player,
    x: player.x,
    y: player.y,
  };

  _drawPlayer(context, scaled_player, map_width);
};

const setDisplay = (canvas) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const _drawViewport = (context, { width, height }) => {
  context.fillStyle = colors.VIEWPORT;
  context.fillRect(0, 0, width, height);
};

const render = ({ canvas, viewport }, gameState) => {
  const { player, map } = gameState;
  const ctx = canvas.getContext("2d");

  const map_settings = {
    scale: 2,
    x: 0,
    y: 0,
  };

  _drawBackground(ctx, canvas);
  _drawViewport(ctx, viewport);
  _draw2dMap(ctx, map, player, map_settings);
  if (gameState.debug) {
  }
};

export { render, setDisplay };
