/**
 * lint hint: this file should import nothing
 * and hold only types and contructors/accessors
 */

import { HttpClient } from "@bity/oauth2-auth-code-pkce";
import { Streamer } from "../stream";
import { ChatLineEvent, RequestSeekClock } from "./lichess-types";
import { z } from "zod/v4";

export const LangZ = z.union([z.literal("en"), z.literal("fr")]);
export type Lang = z.infer<typeof LangZ>;

export type Screen =
  | "home"
  | "game"
  | "events"
  | "seek"
  | "movelist"
  | "challenge"
  | "follow"
  | "end-game"
  | "arena";

export type Role = "Pawn" | "Knight" | "Bishop" | "Rook" | "Queen" | "King";

export const roleToUCILetter = (role: Role) => {
  switch (role) {
    case "Pawn":
      return "p";
    case "Knight":
      return "n";
    case "Bishop":
      return "b";
    case "Rook":
      return "r";
    case "Queen":
      return "q";
    case "King":
      return "k";
  }
};

export const uciLetterToRole = (letter: "p" | "n" | "b" | "r" | "q" | "k") => {
  switch (letter) {
    case "p":
      return "Pawn";
    case "n":
      return "Knight";
    case "b":
      return "Bishop";
    case "r":
      return "Rook";
    case "q":
      return "Queen";
    case "k":
      return "King";
  }
};

export type SquareFile = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type SquareRank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type Square = `${SquareFile}${SquareRank}`;

export const squareFiles: SquareFile[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
];
export const squareRanks: SquareRank[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
];

export const invertRank = (r: SquareRank): SquareRank => {
  switch (r) {
    case "1":
      return "8";
    case "2":
      return "7";
    case "3":
      return "6";
    case "4":
      return "5";
    case "5":
      return "4";
    case "6":
      return "3";
    case "7":
      return "2";
    case "8":
      return "1";
  }
};

export const getFile = (s: Square) => s[0] as SquareFile;
export const getRank = (s: Square) => s[1] as SquareRank;
export const makeSquare = (f: SquareFile, r: SquareRank) => (f + r) as Square;

export type Nullable<T> = T | null;

export const nullable = <T>(): Nullable<T> => null;

export type MoveEffect = {
  check: boolean;
  checkmate: boolean;
};
export type MoveNormal = MoveEffect & {
  readonly _tag: "Normal";
  role: Role;
  from: Square;
  capture: Nullable<Role>;
  to: Square;
  promotion: Nullable<Role>;
};

export const moveNormal = (
  role: Role,
  from: Square,
  to: Square,
  capture: Nullable<Role>,
  promotion: Nullable<Role>,
  check: boolean,
  checkmate: boolean
): MoveNormal => ({
  _tag: "Normal",
  role,
  from,
  to,
  capture: capture,
  promotion: promotion,
  check,
  checkmate,
});

export type MoveEnPassant = MoveEffect & {
  readonly _tag: "EnPassant";
  from: Square;
  to: Square;
};
export const moveEnPassant = (
  from: Square,
  to: Square,
  check: boolean,
  checkmate: boolean
): MoveEnPassant => ({
  _tag: "EnPassant",
  from,
  to,
  check,
  checkmate,
});

type CastleKingSquare = "E1" | "E8";
type CastleRookSquare = "H1" | "H8" | "A1" | "A8";

export type MoveCastle = MoveEffect & {
  readonly _tag: "Castle";
  king: CastleKingSquare;
  rook: CastleRookSquare;
};

export const moveCastle = (
  king: CastleKingSquare,
  rook: CastleRookSquare,
  check: boolean,
  checkmate: boolean
): MoveCastle => ({
  _tag: "Castle",
  king,
  rook,
  check,
  checkmate,
});

export type Move = MoveNormal | MoveCastle | MoveEnPassant;

export const getMoveRole = (move: Move): Role => {
  switch (move._tag) {
    case "Castle":
      return "King";
    case "EnPassant":
      return "Pawn";
    case "Normal":
      return move.role;
  }
};

export const getMoveTo = (move: Move): Square => {
  switch (move._tag) {
    case "Castle": {
      switch (move.king) {
        case "E1":
          return move.rook === "H1" ? "G1" : "C1";
        case "E8":
          return move.rook === "H8" ? "G8" : "C8";
      }
    }
    case "EnPassant":
    case "Normal":
      return move.to;
  }
};

export const getMoveFrom = (move: Move): Square => {
  switch (move._tag) {
    case "Castle": {
      return move.king;
    }
    case "EnPassant":
    case "Normal":
      return move.from;
  }
};
export const getMoveCapture = (move: Move): boolean => {
  switch (move._tag) {
    case "Castle": {
      return false;
    }
    case "EnPassant":
      return true;
    case "Normal":
      return move.capture !== null;
  }
};

export const moveToUCI = (move: Move): string => {
  const parts = [
    getMoveFrom(move),
    getMoveTo(move),
    move._tag === "Normal" && move.promotion !== null
      ? roleToUCILetter(move.promotion)
      : "",
  ];

  return parts.join("").toLowerCase();
};

export type Color = "black" | "white";

export const otherColor = (color: Color): Color =>
  color === "black" ? "white" : "black";

export type ChallengeColor = Color | "random";

// export type ClockInitial = { readonly _tag: "initial" };

// export const clockInitial = (): ClockInitial => ({ _tag: "initial" });

// export type ClockRunning = {
//   readonly _tag: "running";
//   start_time: number;
//   remaining_white: number;
//   remaining_black: number;
// };

// export const clockRunning = (
//   start_time: number,
//   remaining_white: number,
//   remaining_black: number
// ): ClockRunning => ({
//   _tag: "running",
//   start_time,
//   remaining_white,
//   remaining_black,
// });

// export type ClockFlag = {
//   readonly _tag: "flag";
//   color: Color; // fallen color
//   other: number; // other's time
// };

// export const clockFlag = (color: Color, other: number): ClockFlag => ({
//   _tag: "flag",
//   color,
//   other,
// });

export type ClockState = {
  interval: number;
  gameId: string;
};

export type Position = {
  // turn: Color;
  legalMoves: Move[];
  fen: string;
};

export const position = (legalMoves: Move[], fen: string): Position => ({
  legalMoves,
  fen,
});

export const FEN_INITIAL_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type InputNone = {
  readonly _tag: "none";
};

export const inputNone = (): InputNone => ({
  _tag: "none",
});

export type InputRole = {
  readonly _tag: "role";
  role: Role;
};

export const inputRole = (role: Role): InputRole => ({
  _tag: "role",
  role,
});

export type InputCandidates = {
  readonly _tag: "candidates";
  role: Role;
  candidates: Move[];
};

export const inputCandidates = (
  role: Role,
  candidates: Move[]
): InputCandidates => ({
  _tag: "candidates",
  role,
  candidates,
});

export type InputMove = {
  readonly _tag: "move";
  move: Move;
};

export const inputMove = (move: Move): InputMove => ({
  _tag: "move",
  move,
});

export type SomeInput = InputRole | InputCandidates | InputMove;
export type Input = InputNone | SomeInput;

export const getInputRole = (input: SomeInput): Role => {
  switch (input._tag) {
    case "role":
    case "candidates":
      return input.role;
    case "move":
      return getMoveRole(input.move);
  }
};

export const getInputMove = (input: Input): Nullable<Move> => {
  switch (input._tag) {
    case "none":
    case "role":
    case "candidates":
      return null;
    case "move":
      return input.move;
  }
};

export const getInputTo = (input: Input): Nullable<Square> => {
  const move = getInputMove(input);
  return move ? getMoveTo(move) : null;
};

type EngineIdle = { readonly _tag: "idle" };
export const engineIdle = (): EngineIdle => ({ _tag: "idle" });

type EngineComputing = { readonly _tag: "compute" };
export const engineCompute = (): EngineComputing => ({ _tag: "compute" });

export type EngineScoreNone = { readonly _tag: "None" };
export type EngineScoreMate = { readonly _tag: "Mate"; moves: number };
export type EngineScoreCentiPawns = {
  readonly _tag: "CentiPawns";
  score: number;
};
export type EngineScore =
  | EngineScoreNone
  | EngineScoreMate
  | EngineScoreCentiPawns;

export const engineScoreNone = (): EngineScore => ({ _tag: "None" });

type EngineMove = {
  readonly _tag: "move";
  move: Move;
  legals: Move[];
  status: string;
  score: EngineScore;
};
export const engineMove = (
  move: Move,
  legals: Move[],
  score: EngineScore,
  status: string
): EngineMove => ({
  _tag: "move",
  move,
  legals,
  score,
  status,
});

export type EngineState = EngineIdle | EngineComputing | EngineMove;
export const defaultEngine = (): EngineState => engineIdle();

export type MoveHist = {
  readonly _tag: "hist";
  move: Move;
  legals: Move[];
  resultingFen: string;
};
export const moveHist = (
  move: Move,
  legals: Move[],
  resultingFen: string
): MoveHist => ({
  _tag: "hist",
  move,
  legals,
  resultingFen,
});

type GameConfig = {
  black: number;
  white: number;
  engineColor: Color;
  fen: Nullable<string>;
};

export const gameConfig = (
  white: number,
  black: number,
  engineColor: Color,
  position = null as Nullable<string>
): GameConfig => ({ black, white, engineColor, fen: position });

export type Eco = {
  name: string;
  code: string;
  fen: string;
  moves: Move[];
  pgn: string;
};

export type SavedGame = {
  hist: MoveHist[];
  config: GameConfig;
  outcome: Nullable<string>;
  timestamp: number;
};

export const savedGame = (
  hist: MoveHist[],
  config: GameConfig,
  outcome: Nullable<string>,
  timestamp: number
): SavedGame => ({
  hist,
  config,
  outcome,
  timestamp,
});
export type UserConfig_ = {
  id: string;
  username: string;
  httpClient: HttpClient;
  streamer: Streamer;
  perfs: { [key: string]: any }; // ??
};

export type UserConfig = Omit<UserConfig_, "perfs">;

export const stampEvent = <T>(event: T): T & { timestamp: number } => ({
  ...event,
  timestamp: Date.now(),
});

export type LichessAI = {
  readonly _tag: "lichess-ai";
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type SeekRequestSending = {
  readonly _tag: "sending";
  since: number;
  request: RequestSeekClock;
};

export const seekRequestSending = (
  request: RequestSeekClock
): SeekRequestSending => ({
  _tag: "sending",
  since: Date.now(),
  request,
});

export type SeekRequestSent = {
  readonly _tag: "sent";
  since: number;
  request: RequestSeekClock;
  cancel: () => void;
};

export const seekRequestSent = (
  request: RequestSeekClock,
  cancel: () => void
): SeekRequestSent => ({
  _tag: "sent",
  since: Date.now(),
  request,
  cancel,
});

export type SeekRequest = SeekRequestSending | SeekRequestSent;

export type TournamentJoin = {
  id: string;
  since: number;
  interval: number;
};

export type Message = {
  from: string;
  body: string;
  timestamp: number;
};

export const message = (from: string, body: string): Message =>
  stampEvent({ from, body });

export const messageFromChatEvent = ({ username, text }: ChatLineEvent) =>
  message(username, text);

export type VictoryClaim = {
  readonly _tag: "claim";
  at: number;
};

export const claim = (at: number): VictoryClaim => ({ _tag: "claim", at });
