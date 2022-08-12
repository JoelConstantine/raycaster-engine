const colors = {
  MAP_BACKGROUND: "rgb(0,0,0)",
  PLAYER_COLOR: "rgb(232,17,64)",
  WALL_COLOR: "rgb(255,255,255)",
  VIEWPORT: "rgb(125,125,125)",
};

const one_degree = 0.01745329;

const dist = (ax, ay, bx, by, angle) => {
  return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
};

function _drawRays3d(context, rays) {
  rays.forEach((ray, r) => {
    const line_offset = 160 - ray.line_height / 2;
    context.lineWidth = 8;
    context.strokeStyle = colors.PLAYER_COLOR;
    context.beginPath();
    context.moveTo(r * 8 + 512 + 9, line_offset);
    context.lineTo(r * 8 + 512 + 9, ray.line_height + line_offset);
    context.stroke();
    context.closePath();
  });
}

function _drawRays2d(context, rays, x, y) {
  rays.forEach((ray) => {
    context.lineWidth = 1;
    context.strokeStyle = "rgb(0,255,255)";
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(ray.ray_x, ray.ray_y);
    context.stroke();
    context.closePath();
  });
}

function _castRays(
  { player_x, player_y, angle },
  { map_width, map_size, map_height, layout },
) {
  const FOV = 60;

  const PI = Math.PI;
  const P2 = Math.PI / 2;
  const P3 = (3 * Math.PI) / 2;
  let mx, my, map_position, depth_of_field;
  let ray_x,
    ray_y,
    ray_angle = angle - one_degree * (FOV / 2),
    x_offset,
    y_offset;

  if (ray_angle < 0) {
    ray_angle += 2 * PI;
  }

  if (ray_angle > 2 * PI) {
    ray_angle -= 2 * PI;
  }

  let horizontal_x = player_x,
    horizontal_y = player_y,
    vertical_x = player_x,
    vertical_y = player_y;

  let rays = [];

  for (let r = 0; r < FOV; r++) {
    let disH = 1000000;
    let disV = 1000000;
    let disT;

    // casts vertical rays
    depth_of_field = 0;
    let arc_tan = -1 / Math.tan(ray_angle);
    if (ray_angle > PI) {
      ray_y = Math.floor(player_y / 64) * 64 - 0.0001;
      ray_x = (player_y - ray_y) * arc_tan + player_x;
      y_offset = -64;
      x_offset = -y_offset * arc_tan;
    }
    if (ray_angle < PI) {
      ray_y = Math.floor(player_y / 64) * 64 + 64;
      ray_x = (player_y - ray_y) * arc_tan + player_x;
      y_offset = 64;
      x_offset = -y_offset * arc_tan;
    }
    // looking left or right, do nothing
    if (ray_angle === 0 || ray_angle === PI) {
      ray_x = player_x;
      ray_y = player_y;
      depth_of_field = 8;
    }
    while (depth_of_field < 8) {
      mx = parseInt(ray_x / 64);
      my = parseInt(ray_y / 64);
      map_position = my * map_width + mx;
      if (map_position < map_width * map_height && layout[map_position] === 1) {
        horizontal_x = ray_x;
        horizontal_y = ray_y;
        disH = dist(player_x, player_y, horizontal_x, horizontal_y, ray_angle);
        depth_of_field = 8;
      } else {
        ray_x += x_offset;
        ray_y += y_offset;
        depth_of_field += 1;
      }
    }

    // casts horizontal rays
    const negative_tan = -Math.tan(ray_angle);
    depth_of_field = 0;
    if (ray_angle > P2 && ray_angle < P3) {
      ray_x = Math.floor(player_x / 64) * 64 - 0.0001;
      ray_y = (player_x - ray_x) * negative_tan + player_y;
      x_offset = -64;
      y_offset = -x_offset * negative_tan;
    }
    if (ray_angle < P2 || ray_angle > P3) {
      ray_x = Math.floor(player_x / 64) * 64 + 64;
      ray_y = (player_x - ray_x) * negative_tan + player_y;
      x_offset = 64;
      y_offset = -x_offset * negative_tan;
    }
    // looking left or right, do nothing
    if (ray_angle === P2 || ray_angle === P3) {
      ray_x = player_x;
      ray_y = player_y;
      depth_of_field = 8;
    }
    while (depth_of_field < 8) {
      mx = parseInt(ray_x / 64);
      my = parseInt(ray_y / 64);
      map_position = my * map_width + mx;
      if (map_position < map_width * map_height && layout[map_position] === 1) {
        vertical_x = ray_x;
        vertical_y = ray_y;
        disV = dist(player_x, player_y, vertical_x, vertical_y, ray_angle);
        depth_of_field = 8;
      } else {
        ray_x += x_offset;
        ray_y += y_offset;
        depth_of_field += 1;
      }
    }

    if (disH < disV) {
      ray_x = horizontal_x;
      ray_y = horizontal_y;
      disT = disH;
    }
    if (disH > disV) {
      ray_x = vertical_x;
      ray_y = vertical_y;
      disT = disV;
    }

    let calculated_angle = angle - ray_angle;

    if (calculated_angle < 0) {
      calculated_angle += 2 * PI;
    }

    if (calculated_angle > 2 * PI) {
      calculated_angle -= 2 * PI;
    }

    disT = disT * Math.cos(calculated_angle);

    let line_height = (map_size * 320) / disT;
    if (line_height > 320) line_height = 320;

    ray_angle += one_degree;
    if (ray_angle < 0) {
      ray_angle += 2 * PI;
    }

    if (ray_angle > 2 * PI) {
      ray_angle -= 2 * PI;
    }

    rays.push({
      ray_x,
      ray_y,
      line_height,
    });
  }

  return rays;
}

function _drawPlayer(
  context,
  { player_x, player_y, delta_x, delta_y, player_offset },
  scale,
) {
  context.fillStyle = colors.PLAYER_COLOR;
  context.fillRect(
    player_x - scale / 2,
    player_y - scale / 2,
    1 * scale,
    1 * scale,
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
          map_size - 1,
          map_size - 1,
        );
      }
    }
  }

  const scaled_player = {
    ...player,
    player_x: player.player_x,
    player_y: player.player_y,
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

  const rays = _castRays(player, map);

  _drawBackground(ctx, canvas);
  _drawViewport(ctx, viewport);
  _draw2dMap(ctx, map, player, map_settings);
  _drawRays3d(ctx, rays);
  _drawRays2d(ctx, rays, player.player_x, player.player_y);
  if (gameState.debug) {
  }
};

export { render, setDisplay };
