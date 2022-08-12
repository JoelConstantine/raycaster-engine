const colors = {
  MAP_BACKGROUND: "rgb(0,0,0)",
  PLAYER_COLOR: "rgb(232,17,64)",
  WALL_COLOR: "rgb(255,255,255)",
  VIEWPORT: "rgb(125,125,125)",
  WALLS: {
    h: "rgb(240,60,0)",
    v: "rgb(120,30,0)",
  },
};

function _renderPaused(context, { width, height }) {
  context.fillStyle = "rgba(0,0,0,0.5)";
  context.fillRect(0, 0, width, height);
}

function _drawRays3d(context, { rays }, window) {
  const { x = 0, y = 0, width = 480, height = 480 } = window;
  const line_width = width / rays.length;

  const middle = height / 2;

  context.fillStyle = "rgb(0,255,255)";
  context.fillRect(x, y, width, height / 2);
  context.fillStyle = "rgb(0,125,0)";
  context.fillRect(x, y + height / 2, width, height / 2);

  rays.forEach((ray, ridx) => {
    const height_ratio = (height * ray.line_height) / 100;
    const line_offset = middle - height_ratio / 2;
    const wall_color = colors.WALLS[ray.wall_type];
    context.lineWidth = line_width + 1;
    context.strokeStyle = wall_color;
    context.beginPath();
    context.moveTo(ridx * line_width + x + line_width / 2, y + line_offset);
    context.lineTo(
      ridx * line_width + x + line_width / 2,
      height - line_offset,
    );
    context.stroke();
    context.closePath();
  });
}

function _drawRays2d(context, rays, { x, y, offset_x, offset_y }) {
  rays.forEach((ray) => {
    context.lineWidth = 1;
    context.strokeStyle = "rgb(0,255,255)";
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(offset_x + ray.ray_x, offset_y + ray.ray_y);
    context.stroke();
    context.closePath();
  });
}

function _drawPlayer(
  context,
  { player_x, player_y, delta_x, delta_y, player_offset },
  scale,
) {
  context.fillStyle = colors.PLAYER_COLOR;
  context.fillRect(
    player_x - scale / 2 / 2,
    player_y - scale / 2 / 2,
    (1 * scale) / 2,
    (1 * scale) / 2,
  );

  // const offset_x = player_x + delta_x * Math.abs(player_offset.x);
  // const offset_y = player_y + delta_y * Math.abs(player_offset.y);

  // context.fillStyle = "rgb(255,75,125)";
  // context.fillRect(offset_x, offset_y, 2, 2);

  // context.lineWidth = 3;
  // context.strokeStyle = colors.PLAYER_COLOR;
  // context.beginPath();
  // context.moveTo(player_x, player_y);
  // context.lineTo(player_x + delta_x * 64, player_y + delta_y * 64);
  // context.stroke();
  // context.closePath();
}

function _drawBackground(context, { width, height }) {
  context.fillStyle = "rgb(0,0,0)";
  context.fillRect(0, 0, width, height);
}

const _draw2dMap = (context, { map, player }, rays, { x, y }) => {
  const { map_width, map_height, map_size, layout } = map;
  const window_size = map_size * map_width;
  const block_size = window_size / map_width;
  context.fillStyle = colors.MAP_BACKGROUND;
  context.fillRect(x, y, window_size, window_size);

  for (let row = 0; row < map_width; row++) {
    for (let col = 0; col < map_height; col++) {
      const wall_index = row * 8 + col;
      if (layout[wall_index]) {
        const fill_style = colors.WALL_COLOR;

        context.fillStyle = fill_style;
        context.fillRect(
          x + block_size * col,
          y + block_size * row,
          block_size - 1,
          block_size - 1,
        );
      }
    }
  }

  const scaled_player = {
    ...player,
    player_x: player.player_x + x,
    player_y: player.player_y + y,
  };

  _drawPlayer(context, scaled_player, map_width);
  _drawRays2d(context, rays, {
    x: scaled_player.player_x,
    y: scaled_player.player_y,
    offset_x: x,
    offset_y: y,
  });
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
  const ctx = canvas.getContext("2d");

  const map_2d_window = {
    scale: 2,
    x: 0,
    y: 801,
  };

  const map_3d_window = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };

  _drawBackground(ctx, canvas);
  _drawViewport(ctx, viewport);

  _drawRays3d(ctx, gameState, map_3d_window);

  _draw2dMap(ctx, gameState, gameState.rays, map_2d_window);

  if (gameState.paused) {
    _renderPaused(ctx, canvas);
  }
  if (gameState.debug) {
  }
};

export { render, setDisplay };
