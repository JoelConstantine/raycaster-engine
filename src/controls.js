import _ from "lodash";

const KEY_CODES = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
  PAGEUP: 33,
  PAGEDOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  TILDA: 192,
};

const PLAYER_ACTIONS = {
  [KEY_CODES.W]: "forward",
  [KEY_CODES.S]: "backward",
  [KEY_CODES.A]: "left",
  [KEY_CODES.D]: "right",
  [KEY_CODES.LEFT]: "strafe_left",
  [KEY_CODES.RIGHT]: "strafe_right",
  [KEY_CODES.ESC]: "paused",
};

function initControls(player_actions) {
  const state_keys = Object.keys(player_actions);

  let state = _.reduce(
    state_keys,
    (value, key) => ({ ...value, [player_actions[key]]: false }),
    {},
  );

  const _onKey = (val, player_actions) => (e) => {
    const action = player_actions[e.keyCode];
    if (!action) return;
    state[action] = val;
    e.preventDefault();
    e.stopPropagation();
  };

  document.addEventListener("keydown", _onKey(true, player_actions), false);
  document.addEventListener("keyup", _onKey(false, player_actions), false);

  return {
    getState: () => state,
    reset: () => {
      document.removeEventListener("keydown", _onKey, false);
      document.removeEventListener("keyup", _onKey, false);
    },
  };
}

export { initControls, PLAYER_ACTIONS };
