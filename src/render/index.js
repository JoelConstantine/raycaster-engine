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

const PI = Math.PI;
const degToRad = (a) => {
  return (a * PI) / 180.0;
};
const FixAng = (a) => {
  if (a > 359) {
    a -= 360;
  }
  if (a < 0) {
    a += 360;
  }
  return a;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const one_degree = 0.01745329;

function _renderPaused(context, { width, height }) {
  context.fillStyle = "rgba(0,0,0,0.5)";
  context.fillRect(0, 0, width, height);
}

function getPixel(url, x, y) {
  const img = new Image();
  img.src = url;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  return context.getImageData(x, y, 1, 1).data;
}

async function _draw3dMap(
  render_context,
  { rays, map, textures, player },
  window_settings,
) {
  const { x = 0, y = 0, width, height } = window_settings;
  const { context: full_context } = render_context;

  const offScreenCanvas = document.createElement("canvas");
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;

  const context = offScreenCanvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  offScreenCanvas.textureBuffer = document.createElement("canvas");
  offScreenCanvas.textureBuffer.width = 32;
  offScreenCanvas.textureBuffer.height = 32;

  const texture_context = offScreenCanvas.textureBuffer.getContext("2d");

  const floor_texture = textures[2];

  //const processed_texture = context.createImageData(floor_texture);
  texture_context.imageSmoothingEnabled = false;
  texture_context.drawImage(floor_texture, 0, 0);

  const image_data = texture_context.getImageData(0, 0, 32, 32);

  const { player_x, player_y, angle } = player;

  const { map_size } = map;
  const line_width = width / rays.length;

  const middle = height / 2;

  // set the background
  context.fillStyle = "rgb(0,255,255)";
  context.fillRect(x, y, width, height / 2);

  rays.forEach(async (ray, col) => {
    const { disT, ray_x, ray_y, ray_angle, wall_type, position_value } = ray;

    const full_line_height = parseInt((map_size * height) / disT);
    // line height is measured as a percentage  of 100

    const line_height = full_line_height < height ? full_line_height : height;
    const line_offset = middle - line_height / 2;

    const texture = textures
      .filter((_, idx) => idx === position_value - 1)
      .reduce((_, value) => value);

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

    const left = Math.floor(col * line_width);
    var z = disT * Math.cos(ray_angle);
    const bottom = full_line_height > height ? height - full_line_height : 0;

    //context.drawImage(texture, 0, 0);

    context.drawImage(
      texture, // image file
      texture_x, // sx, x location to start scaling
      0,
      1,
      32,
      parseInt(left),
      parseInt(bottom / 2 + line_offset),
      Math.ceil(line_width),
      full_line_height,
    );

    if (full_line_height < height) {
      for (
        let floor_y = line_offset + line_height;
        floor_y < height;
        floor_y += 8
      ) {
        const dy = floor_y - height / 2;
        const degree = degToRad(ray_angle);
        const raFix = Math.cos(degToRad(FixAng(angle - ray_angle)));

        texture_x = player_x / 2 + (Math.cos(degree) * 158 * 32) / dy / raFix;
        texture_y = player_y / 2 - (Math.sin(degree) * 158 * 32) / dy / raFix;

        const texture_index =
          (Math.ceil(texture_y) & 31) * 32 + (Math.ceil(texture_x) & 31);

        const color_value = image_data.data[texture_index - 1];

        const modified_texture_index = texture_index * 4;

        const r = image_data.data[modified_texture_index];
        const g = image_data.data[modified_texture_index + 1];
        const b = image_data.data[modified_texture_index + 2];

        context.lineWidth = line_width + 1;
        context.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        context.beginPath();
        context.moveTo(left, parseInt(floor_y));
        context.lineTo(left, parseInt(floor_y) + 8);
        context.stroke();
        context.closePath();
        //const pixel_info = getPixel(floor_texture.src, 0, 0);

        //
      }
    }
  });

  full_context.drawImage(offScreenCanvas, 0, 0);
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
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.5;
};

const _drawViewport = (context, { width, height }) => {
  context.fillStyle = colors.VIEWPORT;
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;
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

const _drawFloors = (
  { context },
  { rays, map, textures, player },
  window_settings,
) => {
  const { height, width } = window_settings;

  const { map_size } = map;

  const texture_width = 32;
  const floor_texture = textures[2];

  const smallest_wall = rays.reduce((current_smallest, ray) => {
    const full_line_height = parseInt((map_size * height) / ray.disT);

    if (full_line_height < current_smallest) return full_line_height;
    return current_smallest;
  }, 100000000);

  for (let y = height / 2 + smallest_wall / 2; y < height; y++) {
    for (let x = 0; x < width; x += texture_width) {
      context.drawImage(floor_texture, 0, y % 32, 32, 1, x, y, 32, 32);
    }
  }
};

const render = ({ canvas, viewport }, gameState) => {
  const context = canvas.getContext("2d");
  const { textures } = gameState;

  const render_context = { canvas, context, width: 640, height: 480 };

  const map_2d_window = {
    scale: 4,
    x: 0,
    y: 0,
  };

  const map_3d_window = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };

  _drawBackground(context, canvas);
  _drawViewport(context, viewport);

  //_drawFloors(render_context, gameState, map_3d_window);
  _draw3dMap(render_context, gameState, map_3d_window);

  //_draw2dMap(context, gameState, gameState.rays, map_2d_window);

  if (gameState.paused) {
    _renderPaused(context, canvas);
  }
  if (gameState.debug) {
  }
};

export { render, setDisplay, initDisplay };
