const one_degree = 0.01745329;

const dist = (ax, ay, bx, by, angle) => {
  return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
};

function castRays(
  { player_x, player_y, angle },
  { map_width, map_size, map_height, layout },
) {
  const FOV = 80;

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

  let hmt, vmt;

  let rays = [];

  for (let r = 0; r < FOV; r++) {
    let disH = 1000000;
    let disV = 1000000;
    let disT;

    // casts horizontal rays
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
      if (
        map_position > 0 &&
        map_position < map_width * map_height &&
        layout[map_position] > 0
      ) {
        horizontal_x = ray_x;
        horizontal_y = ray_y;
        disH = dist(player_x, player_y, horizontal_x, horizontal_y, ray_angle);
        depth_of_field = 8;
        hmt = layout[map_position];
      } else {
        ray_x += x_offset;
        ray_y += y_offset;
        depth_of_field += 1;
      }
    }

    // casts vertical rays
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
      if (
        map_position > 0 &&
        map_position < map_width * map_height &&
        layout[map_position] > 0
      ) {
        vertical_x = ray_x;
        vertical_y = ray_y;
        disV = dist(player_x, player_y, vertical_x, vertical_y, ray_angle);
        depth_of_field = 8;
        vmt = layout[map_position];
      } else {
        ray_x += x_offset;
        ray_y += y_offset;
        depth_of_field += 1;
      }
    }

    let wall_type;

    // horizontal wall
    if (disH < disV) {
      ray_x = horizontal_x;
      ray_y = horizontal_y;
      disT = disH;
      wall_type = "h";
    }

    // vertical wall
    if (disV < disH) {
      ray_x = vertical_x;
      ray_y = vertical_y;
      disT = disV;
      wall_type = "v";
      hmt = vmt;
    }

    // compensates for distance to reduce fisheye effect
    let calculated_angle = angle - ray_angle;

    if (calculated_angle < 0) {
      calculated_angle += 2 * PI;
    }

    if (calculated_angle > 2 * PI) {
      calculated_angle -= 2 * PI;
    }

    disT = disT * Math.cos(calculated_angle);

    rays.push({
      ray_x,
      ray_y,
      ray_angle: (ray_angle * 180) / PI,
      disT,
      wall_type,
      position_value: hmt,
    });

    // update the loop
    ray_angle += one_degree;
    if (ray_angle < 0) {
      ray_angle += 2 * PI;
    }

    if (ray_angle > 2 * PI) {
      ray_angle -= 2 * PI;
    }
  }

  return rays;
}

export { castRays };
