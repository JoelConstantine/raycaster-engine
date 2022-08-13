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

function _draw3dMap(context, { rays, map, textures }, window) {
  const { x = 0, y = 0, width = 480, height = 480 } = window;
  const { map_size } = map;
  const line_width = width / rays.length;

  const middle = height / 2;

  context.fillStyle = "rgb(0,255,255)";
  context.fillRect(x, y, width, height / 2);
  context.fillStyle = "rgb(0,125,0)";
  context.fillRect(x, y + height / 2, width, height / 2);

  rays.forEach((ray, col) => {
    const { disT, ray_x, ray_y, ray_angle, wall_type, position_value } = ray;

    const shader_value = wall_type === "h" ? 0.5 : 1;

    context.lineWidth = line_width + 1;
    const full_line_height = parseInt((map_size * height) / disT);
    // line height is measured as a percentage  of 100

    const line_height = full_line_height < height ? full_line_height : height;
    const line_offset = middle - line_height / 2;

    const texture = textures
      .filter((_, idx) => idx === position_value - 1)
      .flat();

    const step_counts = parseInt((line_height / height) * 100);

    const texture_step = 32 / full_line_height;
    const texture_offset =
      full_line_height > height ? (full_line_height - height) / 2 : 0;

    let texture_y = texture_step * texture_offset;
    let texture_x;
    if (ray.wall_type === "v") {
      texture_x = parseInt(ray_y / 2) % 32;
      if (ray_angle > 90 && ray_angle < 270) {
        texture_x = 31 - texture_x;
      }
    } else {
      texture_x = parseInt(ray_x / 2) % 32;
      if (ray_angle < 180) {
        texture_x = 31 - texture_x;
      }
    }

    let texture_x_2 = parseInt((col * 32) / rays.length);

    const texture_y_step = 32 / line_height;
    //context.strokeStyle = wall_color;

    const step_value = line_height / step_counts;
    //context.lineTo(idx * line_width + x + line_width / 2, height - line_offset);
    [...Array(parseInt(step_counts))].forEach((_, render_step) => {
      const texture_index =
        Math.round(
          texture_y +
            texture_step * ((line_height * render_step) / step_counts),
        ) * 32;

      const c = texture[texture_index + texture_x] * 255 * shader_value;
      const stroke_style = `rgb(${c * shader_value},${c},${c})`;

      const x_pos = col * line_width + x + line_width / 2;

      const y_pos = y + line_offset + step_value * render_step;

      //if (c) console.log(stroke_style);
      context.strokeStyle = stroke_style;
      context.beginPath();
      context.moveTo(x_pos, y_pos);
      context.lineTo(x_pos, y_pos + step_value);
      context.closePath();
      context.stroke();
    });
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

  _draw3dMap(ctx, gameState, map_3d_window);

  //_draw2dMap(ctx, gameState, gameState.rays, map_2d_window);

  if (gameState.paused) {
    _renderPaused(ctx, canvas);
  }
  if (gameState.debug) {
  }
};

export { render, setDisplay, initDisplay };
