function _drawPlayer(context, { x, y }) {
  context.fillStyle = "rgb(0,255,255)";
  context.fillRect(x, y, 1, 1);
}

function _drawBackground(context, { width, height }) {
  context.fillStyle = "rgb(125,125,125)";
  context.fillRect(0, 0, width, height);
}

const _drawMap = (context, map, { width = 128, x = 0, y = 0 }) => {
  const tile_size = width / 8;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const wall_index = row * 8 + col;

      const fill_style =
        map[wall_index] === 0 ? "rgba(0,0,0,0)" : "rgb(225,225,225)";

      context.fillStyle = fill_style;
      context.fillRect(
        x + tile_size * col,
        y + tile_size * row,
        tile_size,
        tile_size,
      );
    }
  }
};

const setDisplay = (canvas) => {
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.5;
};

const render = (canvas, gameState) => {
  const { player, map } = gameState;
  const ctx = canvas.getContext("2d");

  _drawBackground(ctx, canvas);
  _drawMap(ctx, map, { width: 256, x: 0, y: 0 });
  _drawPlayer(ctx, player);
};

export { render, setDisplay };
