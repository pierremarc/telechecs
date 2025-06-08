import { map, Option } from "./lib/option";
import {
  ChallengeJson,
  GameEventInfo,
  GameStateEvent,
  StreamEvent,
} from "./lib/ucui/lichess-types";
import {
  Color,
  otherColor,
  gameConfig,
  Input,
  inputNone,
  position,
  MoveHist,
  ClockState,
  clockInitial,
  Eco,
  Nullable,
  FEN_INITIAL_POSITION,
  LichessScreen,
} from "./lib/ucui/types";
import { isPrivateIP } from "./lib/util";
import { UserConfig } from "./auth";

import { startingLegalMoves } from "./data";
import { uciMoveList } from "./util";

export const getTurn = (): Nullable<Color> => {
  const game = get("lichess/game-state");
  if (game) {
    return uciMoveList(game.moves).length % 2 === 0 ? "white" : "black";
  }
  return null;
};

export const getOponentColor = (): Nullable<Color> => {
  const color = getPlayerColor();
  if (color) {
    return otherColor(color);
  }
  return null;
};

export const getPlayerColor = (): Nullable<Color> => {
  const info = get("lichess/game-info");
  if (info) {
    return info.color;
  }
  return null;
};

export const defaultGameConfig = () =>
  gameConfig(10 * 60 * 1000, 60 * 1000, "black");
export const defaultInput = (): Input => inputNone();
export const defaultPosition = () =>
  position(startingLegalMoves, FEN_INITIAL_POSITION);
export const defaultScreen = (): LichessScreen => "home";
export const defaultMoveList = (): MoveHist[] => [];
export const defaultClock = (): ClockState => clockInitial();
export const defaultEcoList = (): Eco[] => [];

let state = {
  screen: defaultScreen(),
  clock: defaultClock(),
  input: defaultInput(),
  started: false,
  lockScreen: false,
  // gameConfig: defaultGameConfig(),
  "lichess/host": "https://lichess.org",
  "lichess/user": null as Nullable<UserConfig>,
  "lichess/stream-events": [] as StreamEvent[],
  "lichess/challenges": [] as ChallengeJson[],
  "lichess/current-challenge": null as Nullable<ChallengeJson>,
  "lichess/game-info": null as Nullable<GameEventInfo>,
  "lichess/game-state": null as Nullable<GameStateEvent>,
};

export type State = typeof state;
export type StateKey = keyof State;

const storedKeys: StateKey[] = [];

const loadFromStorage = () =>
  storedKeys.map(<K extends StateKey>(key: K) => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      state[key] = JSON.parse(item) as State[K];
    }
  });

loadFromStorage();

let subs: [StateKey, (key: StateKey) => void][] = [];

export const dispatch = <K extends StateKey>(
  key: K,
  f: (val: State[K]) => State[K]
) => {
  let val = get(key);
  state[key] = f(val);
  if (storedKeys.includes(key)) {
    localStorage.setItem(key, JSON.stringify(state[key]));
  }
  const subscribers = subs.filter(([k, _]) => k == key);
  for (const sub of subscribers) {
    const handler = sub[1];
    handler(key);
  }
  if (key !== "clock") {
    console.groupCollapsed(key);
    console.debug("from", val);
    console.debug("to", state[key]);
    console.debug("subscribers", subscribers);
    console.groupEnd();
  }
  return get(key);
};

export const dispatchOpt = <K extends StateKey>(
  key: K,
  f: (val: State[K]) => Option<State[K]>
) => map((value: State[K]) => assign(key, value))(f(get(key)));

export const assign = <K extends StateKey>(key: K, val: State[K]) =>
  dispatch(key, () => val);

export const get = <K extends StateKey>(key: K): State[K] =>
  JSON.parse(JSON.stringify(state[key]));

export const getMutable = <K extends StateKey>(key: K): State[K] => state[key];

export const allKeys = () => Object.keys(state) as StateKey[];

export const subscribe =
  (...keys: StateKey[]) =>
  (callback: (key: StateKey) => void) =>
    (subs = subs.concat(keys.map((k) => [k, callback])));

export const clearSubscriptions = (filter: (k: StateKey) => boolean) =>
  (subs = subs.filter(([k, _]) => filter(k)));

if (isPrivateIP(document.location.hostname)) {
  Object.assign(window, { UcuiState: state });
}
