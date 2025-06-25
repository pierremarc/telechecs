import { map, Option } from "./lib/option";
import {
  ArenaTournament,
  ChallengeJson,
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
  MoveHist,
  Eco,
  Nullable,
  Screen,
  Move,
  ClockState,
  LichessAI,
  Lang,
  ChallengeColor,
  SquareFile,
  SquareRank,
  SeekRequest,
  TournamentJoin,
  Message,
} from "./lib/ucui/types";
import { isPrivateIP } from "./lib/util";
import { UserConfig } from "./lib/ucui/types";

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
// export const defaultPosition = () =>
//   position(startingLegalMoves, FEN_INITIAL_POSITION);
export const defaultScreen = (): Screen => "home";
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
  "lichess/chat": null as Nullable<Message>,
  "lichess/seek": null as Nullable<SeekRequest>,
  "lichess/arena-created": [] as ArenaTournament[],
  "lichess/arena-started": [] as ArenaTournament[],
  "lichess/arena-join": null as Nullable<TournamentJoin>,
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

export const batch_dispacther = () => {
  const keys = new Set<StateKey>();

  const dispatch = <K extends StateKey>(
    key: K,
    f: (val: State[K]) => State[K]
  ) => {
    let val = get(key);
    state[key] = f(val);
    if (storedKeys.includes(key)) {
      localStorage.setItem(key, JSON.stringify(state[key]));
    }

    if (key !== "clock") {
      console.groupCollapsed(key);
      console.debug("from", val);
      console.debug("to", state[key]);
      console.groupEnd();
    }
    keys.add(key);
    return get(key);
  };

  const assign = <K extends StateKey>(key: K, val: State[K]) =>
    dispatch(key, () => val);

  const end = () => {
    setTimeout(() => {
      for (const key of keys) {
        const subscribers = subs.filter(([k, _]) => k == key);
        for (const sub of subscribers) {
          const handler = sub[1];
          handler(key);
          keys.delete(key);
        }
      }
    }, 0);
  };

  return { dispatch, assign, end };
};

export const withBatch = <R>(
  f: (d: ReturnType<typeof batch_dispacther>) => R
) => f(batch_dispacther());

const immediate_dispatch = batch_dispacther();

export const dispatch = <K extends StateKey>(
  key: K,
  f: (val: State[K]) => State[K]
) => {
  immediate_dispatch.dispatch(key, f);
  immediate_dispatch.end();
  return get(key);
};

export type Dispath = typeof dispatch;

export const dispatchOpt = <K extends StateKey>(
  key: K,
  f: (val: State[K]) => Option<State[K]>
) => map((value: State[K]) => assign(key, value))(f(get(key)));

export const assign = <K extends StateKey>(key: K, val: State[K]) =>
  dispatch(key, () => val);

export type Assign = typeof assign;

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
