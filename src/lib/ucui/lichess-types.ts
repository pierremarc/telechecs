import { z } from "zod/v4";

export const ColorZ = z.union([z.literal("white"), z.literal("black")]);

export const SourceZ = z.union([
  z.literal("lobby"),
  z.literal("friend"),
  z.literal("ai"),
  z.literal("api"),
  z.literal("tournament"),
  z.literal("position"),
  z.literal("import"),
  z.literal("importlive"),
  z.literal("simul"),
  z.literal("relay"),
  z.literal("pool"),
  z.literal("swiss"),
]);

export const StatusZ = z.union([
  z.strictObject({ id: z.literal(10), name: z.literal("created") }),
  z.strictObject({ id: z.literal(20), name: z.literal("started") }),
  z.strictObject({ id: z.literal(25), name: z.literal("aborted") }),
  z.strictObject({ id: z.literal(30), name: z.literal("mate") }),
  z.strictObject({ id: z.literal(31), name: z.literal("resign") }),
  z.strictObject({ id: z.literal(32), name: z.literal("stalemate") }),
  z.strictObject({ id: z.literal(33), name: z.literal("timeout") }),
  z.strictObject({ id: z.literal(34), name: z.literal("draw") }),
  z.strictObject({ id: z.literal(35), name: z.literal("outoftime") }),
  z.strictObject({ id: z.literal(36), name: z.literal("cheat") }),
  z.strictObject({ id: z.literal(37), name: z.literal("noStart") }),
  z.strictObject({ id: z.literal(38), name: z.literal("unknownFinish") }),
  z.strictObject({ id: z.literal(60), name: z.literal("variantEnd") }),
]);

export const SpeedZ = z.union([
  z.literal("ultraBullet"),
  z.literal("bullet"),
  z.literal("blitz"),
  z.literal("rapid"),
  z.literal("classical"),
  z.literal("correspondence"),
]);

export const GameEventOpponentZ = z.strictObject({
  id: z.string(),
  username: z.string(),
  rating: z.number(),
});

export const GameEventOpponentAIZ = z.strictObject({
  id: z.string().nullable(),
  username: z.string(),
  rating: z.number().optional(),
  ai: z.number(),
});

export const GameCompatZ = z.strictObject({
  bot: z.boolean(),
  board: z.boolean(),
});

export const VariantKeyZ = z.union([
  z.literal("standard"),
  z.literal("chess960"),
  z.literal("crazyhouse"),
  z.literal("antichess"),
  z.literal("atomic"),
  z.literal("horde"),
  z.literal("kingOfTheHill"),
  z.literal("racingKings"),
  z.literal("threeCheck"),
  z.literal("fromPosition"),
]);

export const VariantZ = z.strictObject({
  key: VariantKeyZ,
  name: z.string(),
  short: z.string().optional(),
});
export const GameEventInfoZ = z.strictObject({
  id: z.string(),
  fullId: z.string(),
  gameId: z.string(),
  fen: z.string(),
  color: ColorZ,
  lastMove: z.string(),
  source: SourceZ,
  status: StatusZ,
  variant: VariantZ,
  speed: SpeedZ,
  perf: z.string(),
  rated: z.boolean(),
  hasMoved: z.boolean(),
  opponent: z.union([GameEventOpponentZ, GameEventOpponentAIZ]),
  isMyTurn: z.boolean(),
  secondsLeft: z.number().optional(),
  compat: GameCompatZ,
  winner: ColorZ.optional(), // not documented
});

export const GameStartEventZ = z.strictObject({
  type: z.literal("gameStart"),
  game: GameEventInfoZ,
});

export const GameFinishEventZ = z.strictObject({
  type: z.literal("gameFinish"),
  game: GameEventInfoZ,
});

export const ChallengeStatusZ = z.union([
  z.literal("created"),
  z.literal("offline"),
  z.literal("canceled"),
  z.literal("declined"),
  z.literal("accepted"),
]);

export const ChallengeUserZ = z.strictObject({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  title: z.string().nullable(),
  flair: z.string().optional(),
  patron: z.boolean().optional(),
  provisional: z.boolean().optional(),
  online: z.boolean().optional(),
  lag: z.number().optional(),
});

const RealTimeZ = z.strictObject({
  type: z.literal("clock"),
  limit: z.number(),
  increment: z.number(),
  show: z.string(),
});

const CorrespondenceZ = z.strictObject({
  type: z.literal("correspondence"),
  daysPerTurn: z.number(),
});
const UnlimitedZ = z.strictObject({
  type: z.literal("unlimited"),
});

export const TimeControlZ = z.union([RealTimeZ, CorrespondenceZ, UnlimitedZ]);

export const ChallengeJsonZ = z.strictObject({
  id: z.string(),
  url: z.url(),
  status: ChallengeStatusZ,
  challenger: ChallengeUserZ,
  destUser: ChallengeUserZ.nullable(),
  variant: VariantZ,
  rated: z.boolean(),
  speed: SpeedZ,
  timeControl: TimeControlZ,
  color: z.union([ColorZ, z.literal("random")]),
  finalColor: ColorZ,
  perf: z.strictObject({ icon: z.string(), name: z.string() }),
  direction: z.union([z.literal("in"), z.literal("out")]).optional(),
  initialFen: z.string().optional(),
});

export const ChallengeEventZ = z.strictObject({
  type: z.literal("challenge"),
  challenge: ChallengeJsonZ,
  compat: GameCompatZ.optional(),
});

export const ChallengeCanceledEventZ = z.strictObject({
  type: z.literal("challengeCanceled"),
  challenge: ChallengeJsonZ,
  compat: GameCompatZ.optional(),
});

export const DeclineReasonZ = z.union([
  z.literal("generic"),
  z.literal("later"),
  z.literal("tooFast"),
  z.literal("tooSlow"),
  z.literal("timeControl"),
  z.literal("rated"),
  z.literal("casual"),
  z.literal("standard"),
  z.literal("variant"),
  z.literal("noBot"),
  z.literal("onlyBot"),
]);

const ChallengeDeclinedJsonZ = ChallengeJsonZ.extend({
  declineReason: z.string(),
  declineReasonKey: DeclineReasonZ,
});

export const ChallengeDeclinedEventZ = z.strictObject({
  type: z.literal("challengeDeclined"),
  challenge: ChallengeDeclinedJsonZ,
  compat: GameCompatZ.optional(),
});

export const StreamEventZ = z.union([
  GameStartEventZ,
  GameFinishEventZ,
  ChallengeEventZ,
  ChallengeCanceledEventZ,
  ChallengeDeclinedEventZ,
]);

export const ChallengeListZ = z.strictObject({
  in: ChallengeJsonZ.array(),
  out: ChallengeJsonZ.array(),
});

export const RulesZ = z.union([
  z.literal("noAbort"),
  z.literal("noRematch"),
  z.literal("noGiveTime"),
  z.literal("noClaimWin"),
  z.literal("noEarlyDraw"),
]);

export const RequestChallengeCreateClockZ = z.strictObject({
  rated: z.boolean(),
  "clock.limit": z.int(),
  "clock.increment": z.int(),
  color: z.union([ColorZ, z.literal("random")]),
  variant: VariantKeyZ,
  fen: z.string().optional(),
  keepAliveStream: z.boolean(),
  rules: RulesZ.optional(),
});

export const RequestSeekClockZ = z.strictObject({
  limit: z.int(),
  increment: z.int(),
  rated: z.boolean().optional(),
  color: z.union([ColorZ, z.literal("random")]),
  variant: VariantKeyZ,
  ratingRange: z.string().optional(),
});

export const ResponseIdZ = z.strictObject({ id: z.string() });

export const CorrespondenceDaysZ = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(7),
  z.literal(10),
  z.literal(14),
]);

export const RequesChallengeCreateCorrespondenceZ = z.strictObject({
  rated: z.boolean(),
  days: CorrespondenceDaysZ,
  color: z.union([ColorZ, z.literal("random")]),
  variant: VariantKeyZ,
  fen: z.string().optional(),
  keepAliveStream: z.boolean(),
  rules: RulesZ.optional(),
});

export const RequesChallengeCreateZ = z.union([
  RequestChallengeCreateClockZ,
  RequesChallengeCreateCorrespondenceZ,
]);

export const RequesChallengeCreateAIZ = z.strictObject({
  "clock.limit": z.int(),
  "clock.increment": z.int(),
  color: z.union([ColorZ, z.literal("random")]),
  variant: VariantKeyZ,
  fen: z.string().optional(),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
    z.literal(8),
  ]),
});
export const ResponseOkZ = z.strictObject({
  ok: z.boolean(),
});

export const ClockZ = z.strictObject({
  initial: z.int(),
  increment: z.int(),
});

export const PerfNameZ = z.strictObject({ name: z.string() });

export const TitleZ = z.union([
  z.literal("GM"),
  z.literal("WGM"),
  z.literal("IM"),
  z.literal("WIM"),
  z.literal("FM"),
  z.literal("WFM"),
  z.literal("NM"),
  z.literal("CM"),
  z.literal("WCM"),
  z.literal("WNM"),
  z.literal("LM"),
  z.literal("BOT"),
]);

export const GameEventPlayerNormalZ = z.strictObject({
  id: z.string(),
  name: z.string(),
  title: TitleZ.nullable(),
  rating: z.int().nullable(),
  provisional: z.boolean().optional(),
});

export const GameEventPlayerAIZ = z.strictObject({
  aiLevel: z.int(),
});

export const GameEventPlayerZ = z.union([
  GameEventPlayerNormalZ,
  GameEventPlayerAIZ,
]);

export const GameStatusNameZ = z.union([
  z.literal("created"),
  z.literal("started"),
  z.literal("aborted"),
  z.literal("mate"),
  z.literal("resign"),
  z.literal("stalemate"),
  z.literal("timeout"),
  z.literal("draw"),
  z.literal("outoftime"),
  z.literal("cheat"),
  z.literal("noStart"),
  z.literal("unknownFinish"),
  z.literal("variantEnd"),
]);

export const GameStateEventZ = z.strictObject({
  type: z.literal("gameState"),
  moves: z.string(),
  wtime: z.int(),
  btime: z.int(),
  winc: z.int(),
  binc: z.int(),
  status: GameStatusNameZ,
  winner: ColorZ.optional(),
  wdraw: z.boolean().optional(),
  bdraw: z.boolean().optional(),
  wtakeback: z.boolean().optional(),
  btakeback: z.boolean().optional(),
});

export const GameFullEventZ = z.strictObject({
  type: z.literal("gameFull"),
  id: z.string(),
  variant: VariantZ,
  clock: ClockZ,
  speed: SpeedZ,
  perf: PerfNameZ,
  rated: z.boolean(),
  createdAt: z.int(),
  white: GameEventPlayerZ,
  black: GameEventPlayerZ,
  initialFen: z.string(),
  state: GameStateEventZ,
  tournamentId: z.string().optional(),
});

export const ChatLineEventZ = z.strictObject({
  type: z.literal("chatLine"),
  room: z.union([z.literal("player"), z.literal("spectator")]),
  username: z.string(),
  text: z.string(),
});

export const OpponentGoneEventZ = z.strictObject({
  type: z.literal("opponentGone"),
  gone: z.boolean(),
  claimWinInSeconds: z.int(),
});

export const BoardEventZ = z.union([
  GameStateEventZ,
  GameFullEventZ,
  ChatLineEventZ,
  OpponentGoneEventZ,
]);

export const BoardMoveZ = z.strictObject({
  gameId: z.string(),
  move: z.string(),
  offeringDraw: z.boolean().optional(),
});

export const PerfZ = z.strictObject({
  games: z.int(),
  rating: z.int(),
  rd: z.int(),
  prog: z.int(),
  prov: z.boolean().optional(),
});

export const PerfsZ = z.strictObject({
  chess960: PerfZ.optional(),
  atomic: PerfZ.optional(),
  racingKings: PerfZ.optional(),
  ultraBullet: PerfZ.optional(),
  blitz: PerfZ.optional(),
  kingOfTheHill: PerfZ.optional(),
  threeCheck: PerfZ.optional(),
  antichess: PerfZ.optional(),
  crazyhouse: PerfZ.optional(),
  bullet: PerfZ.optional(),
  correspondence: PerfZ.optional(),
  horde: PerfZ.optional(),
  puzzle: PerfZ.optional(),
  classical: PerfZ.optional(),
  rapid: PerfZ.optional(),
  storm: PerfZ.optional(),
  racer: PerfZ.optional(),
  streak: PerfZ.optional(),
});

export const ProfileZ = z.strictObject({
  flag: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  realName: z.string().optional(),
  fideRating: z.int().optional(),
  uscfRating: z.int().optional(),
  ecfRating: z.int().optional(),
  cfcRating: z.int().optional(),
  rcfRating: z.int().optional(),
  dsbRating: z.int().optional(),
  links: z.string().optional(),
});

export const PlayTimeZ = z.strictObject({
  total: z.int(),
  tv: z.int(),
});

export const UserZ = z.object({
  id: z.string(),
  username: z.string(),
  url: z.string().optional(),
  perfs: PerfsZ.optional(),
  title: TitleZ.optional(),
  flair: z.string().optional(),
  createdAt: z.int().optional(),
  disabled: z.boolean().optional(),
  tosViolation: z.boolean().optional(),
  profile: ProfileZ.optional(),
  seenAt: z.int().optional(),
  playTime: PlayTimeZ.optional(),
  patron: z.boolean().optional(),
  verified: z.boolean().optional(),
});

export const RealTimeUserStatusZ = z.strictObject({
  id: z.string(),
  name: z.string(),
  flair: z.string().optional(),
  title: TitleZ.optional(),
  online: z.boolean().optional(),
  playing: z.boolean().optional(),
  streaming: z.boolean().optional(),
  patron: z.boolean().optional(),
});

export const RealTimeUserStatusRequestZ = z.strictObject({
  ids: z.string(),
  withSignal: z.boolean().optional(),
  withGameIds: z.boolean().optional(),
  withGameMetas: z.boolean().optional(),
});

export type Color = z.infer<typeof ColorZ>;
export type Source = z.infer<typeof SourceZ>;
export type Status = z.infer<typeof StatusZ>;
export type Speed = z.infer<typeof SpeedZ>;
export type GameEventOpponent = z.infer<typeof GameEventOpponentZ>;
export type GameCompat = z.infer<typeof GameCompatZ>;
export type VariantKey = z.infer<typeof VariantKeyZ>;
export type GameEventInfo = z.infer<typeof GameEventInfoZ>;
export type GameStartEvent = z.infer<typeof GameStartEventZ>;
export type GameFinishEvent = z.infer<typeof GameFinishEventZ>;
export type ChallengeStatus = z.infer<typeof ChallengeStatusZ>;
export type ChallengeUser = z.infer<typeof ChallengeUserZ>;
export type RealTime = z.infer<typeof RealTimeZ>;
export type Correspondence = z.infer<typeof CorrespondenceZ>;
export type Unlimited = z.infer<typeof UnlimitedZ>;
export type TimeControl = z.infer<typeof TimeControlZ>;
export type ChallengeJson = z.infer<typeof ChallengeJsonZ>;
export type ChallengeEvent = z.infer<typeof ChallengeEventZ>;
export type ChallengeCanceledEvent = z.infer<typeof ChallengeCanceledEventZ>;
export type DeclineReason = z.infer<typeof DeclineReasonZ>;
export type ChallengeDeclinedJson = z.infer<typeof ChallengeDeclinedJsonZ>;
export type ChallengeDeclinedEvent = z.infer<typeof ChallengeDeclinedEventZ>;
export type StreamEvent = z.infer<typeof StreamEventZ>;

export type ChallengeList = z.infer<typeof ChallengeListZ>;
export type Rules = z.infer<typeof RulesZ>;
export type RequesChallengeCreateClock = z.infer<
  typeof RequestChallengeCreateClockZ
>;
export type CorrespondenceDays = z.infer<typeof CorrespondenceDaysZ>;
export type RequesChallengeCreateCorrespondence = z.infer<
  typeof RequesChallengeCreateCorrespondenceZ
>;
export type RequesChallengeCreate = z.infer<typeof RequesChallengeCreateZ>;
export type RequesChallengeCreateAI = z.infer<typeof RequesChallengeCreateAIZ>;
export type ResponseOk = z.infer<typeof ResponseOkZ>;
export type RequestSeekClock = z.infer<typeof RequestSeekClockZ>;
export type ResponseId = z.infer<typeof ResponseIdZ>;

export type Clock = z.infer<typeof ClockZ>;
export type PerfName = z.infer<typeof PerfNameZ>;
export type Title = z.infer<typeof TitleZ>;
export type GameEventPlayer = z.infer<typeof GameEventPlayerZ>;
export type GameStatusName = z.infer<typeof GameStatusNameZ>;
export type GameStateEvent = z.infer<typeof GameStateEventZ>;
export type GameFullEvent = z.infer<typeof GameFullEventZ>;
export type ChatLineEvent = z.infer<typeof ChatLineEventZ>;
export type OpponentGoneEvent = z.infer<typeof OpponentGoneEventZ>;
export type BoardEvent = z.infer<typeof BoardEventZ>;
export type BoardMove = z.infer<typeof BoardMoveZ>;
export type User = z.infer<typeof UserZ>;
export type Perf = z.infer<typeof PerfZ>;
export type Perfs = z.infer<typeof PerfsZ>;
export type Profile = z.infer<typeof ProfileZ>;
export type PlayTime = z.infer<typeof PlayTimeZ>;
export type RealTimeUserStatus = z.infer<typeof RealTimeUserStatusZ>;
export type RealTimeUserStatusRequest = z.infer<
  typeof RealTimeUserStatusRequestZ
>;
