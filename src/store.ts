import { map, Option } from "./lib/option";
import {
  ChallengeJson,
  ChatLineEvent,
  GameEventInfo,
  GameStateEvent,
  StreamEvent,
  User,
} from "./lib/ucui/lichess-types";
import {
  Color,
  otherColor,
  gameConfig,
  Input,
  inputNone,
  position,
  MoveHist,
  Eco,
  Nullable,
  FEN_INITIAL_POSITION,
  LichessScreen,
  Move,
  ClockState,
  LichessAI,
  Lang,
  ChallengeColor,
  SquareFile,
  SquareRank,
  SeekRequest,
} from "./lib/ucui/types";
import { isPrivateIP } from "./lib/util";
import { UserConfig } from "./lib/ucui/types";

import { startingLegalMoves } from "./data";
import { getMoveListFromMoveString, uciMoveList } from "./util";

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

export const getMoveList = (): Move[] => {
  const state = get("lichess/game-state");
  if (state) {
    return getMoveListFromMoveString(state.moves);
  }
  return [];
};

export const getLang = () => get("lang") ?? "en";

export const defaultGameConfig = () =>
  gameConfig(10 * 60 * 1000, 60 * 1000, "black");
export const defaultInput = (): Input => inputNone();
export const defaultPosition = () =>
  position(startingLegalMoves, FEN_INITIAL_POSITION);
export const defaultScreen = (): LichessScreen => "home";
export const defaultMoveList = (): MoveHist[] => [];
export const defaultEcoList = (): Eco[] => [];

let state = {
  lang: null as Nullable<Lang>,
  screen: defaultScreen(),
  clock: null as Nullable<ClockState>,
  input: defaultInput(),
  "input-san/file": null as Nullable<SquareFile>,
  "input-san/rank": null as Nullable<SquareRank>,
  started: false,
  lockScreen: false,
  online: true,
  fullscreen: false,
  ratedChallenge: false,
  challengeColor: "random" as ChallengeColor,
  "lichess/host": import.meta.env.PROD
    ? "https://lichess.org"
    : "http://localhost:8080",
  "lichess/user": null as Nullable<UserConfig>,
  "lichess/stream-events": [] as StreamEvent[],
  "lichess/challenges": [] as ChallengeJson[],
  "lichess/current-challenge": null as Nullable<ChallengeJson>,
  "lichess/my-challenge": null as Nullable<ChallengeJson>,
  "lichess/game-info": null as Nullable<GameEventInfo>,
  "lichess/game-state": null as Nullable<
    GameStateEvent & { timestamp: number }
  >,
  "lichess/opponent": null as Nullable<User | LichessAI>,
  "lichess/following": [] as User[],
  "lichess/chat": null as Nullable<ChatLineEvent & { timestamp: number }>,
  "lichess/seek": null as Nullable<SeekRequest>,
};

export type State = typeof state;
export type StateKey = keyof State;

const storedKeys: StateKey[] = ["lang"];

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
