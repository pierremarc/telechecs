import {
  defaultPostOptions,
  encodeQueryString,
  fetchWithClient,
  fetchZ,
  postWithClient,
  postZ,
  withQueryString,
} from "./lib/remote";
import {
  ArenaTournamentResponseZ,
  BoardEvent,
  BoardEventZ,
  ChallengeJson,
  ChallengeJsonZ,
  ChallengeListZ,
  DeclineReason,
  RealTimeUserStatusZ,
  RequesChallengeCreate,
  RequesChallengeCreateAI,
  RequestSeekClock,
  ResponseIdZ,
  ResponseOk,
  ResponseOkZ,
  StreamEvent,
  StreamEventZ,
  User,
  UserZ,
} from "./lib/ucui/lichess-types";
import { get, getMutable } from "./store";

const apiUrl = (path: string) => [get("lichess/host"), path].join("/api");

/**
 * doc: https://lichess.org/api#tag/Board/operation/apiStreamEvent
 * path: /stream/event
 */
export const streamEvent = (
  handler: (e: StreamEvent) => boolean,
  then: () => void
) => {
  const config = getMutable("lichess/user");
  if (config) {
    const stream = config.streamer(StreamEventZ, apiUrl("/stream/event"));
    stream.onMessage(handler);
    stream.onClose(then);
    return true;
  }
  return false;
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameStream
 * path: /board/game/stream/{gameId}
 */
export const streamBoard = (
  gameId: string,
  handler: (e: BoardEvent) => boolean
) => {
  const config = getMutable("lichess/user");
  if (config) {
    const stream = config.streamer(
      BoardEventZ,
      apiUrl(`/board/game/stream/${gameId}`)
    );
    stream.onMessage(handler);
    return true;
  }
  return false;
};

/**
 * doc: https://lichess.org/api#tag/Relations/operation/apiUserFollowing
 * path: /rel/following
 */
export const streamFollowing = (
  handler: (e: User) => boolean,
  then?: () => void
) => {
  const config = getMutable("lichess/user");
  if (config) {
    const stream = config.streamer(UserZ, apiUrl(`/rel/following`));
    stream.onMessage(handler);
    if (then) {
      stream.onClose(then);
    }

    return true;
  }
  return false;
};

const getFetch = (throwMissingUser = false) => {
  const userConfig = getMutable("lichess/user");
  if (userConfig) {
    return fetchWithClient(userConfig.httpClient);
  }
  if (throwMissingUser) {
    throw new Error("Missing user: generic http client");
  } else {
    console.warn("Missing user: generic http client");
  }
  return fetchZ;
};

const getPoster = (throwMissingUser = false) => {
  const userConfig = getMutable("lichess/user");
  if (userConfig) {
    return postWithClient(userConfig.httpClient);
  }
  if (throwMissingUser) {
    throw new Error("Missing user: generic http client");
  } else {
    console.warn("Missing user: generic http client");
  }
  return postZ;
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeList
 * path: /challenge
 */
export const challengeList = () => {
  const fetch = getFetch();
  return fetch(ChallengeListZ, apiUrl("/challenge"));
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeCreate
 * path: /challenge/{username}
 */
export const challengeCreate = (
  username: string,
  data: RequesChallengeCreate
) => {
  const post = getPoster();
  return post<ChallengeJson>(
    ChallengeJsonZ,
    apiUrl(`/challenge/${username}`),
    data
  );
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeAccept
 * path: /challenge/{challengeId}/accept
 *
 */
export const challengeAccept = (challengeId: string) => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/challenge/${challengeId}/accept`),
    {}
  );
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeDecline
 * path: /challenge/{challengeId}/decline
 *
 */
export const challengeDecline = (
  challengeId: string,
  reason: DeclineReason
) => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/challenge/${challengeId}/decline`),
    {
      reason,
    }
  );
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameMove
 * path: /board/game/{gameId}/move/{move}
 *
 */
export const boardMove = (gameId: string, move: string) => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/board/game/${gameId}/move/${move}`),
    {}
  );
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameAbort
 * path: /board/game/{gameId}/abort
 *
 */
export const boardAbort = (gameId: string) => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/board/game/${gameId}/abort`),
    {}
  );
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameResign
 * path: /board/game/{gameId}/resign
 *
 */
export const boardResign = (gameId: string) => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/board/game/${gameId}/resign`),
    {}
  );
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameDraw
 * path: /board/game/{gameId}/draw/{accept}
 *
 */
export const boardDraw = (gameId: string, accept: "yes" | "no") => {
  const post = getPoster();
  return post<ResponseOk>(
    ResponseOkZ,
    apiUrl(`/board/game/${gameId}/draw/${accept}`),
    {}
  );
};

/**
 * doc: https://lichess.org/api#tag/Users/operation/apiUsers
 * path: /users
 *
 */
export const getUserById = (id: string) => {
  const post = getPoster();
  return post(UserZ.array(), apiUrl(`/users`), id).then((users) => {
    for (const user of users) {
      if (user.id === id) {
        return user;
      }
    }
    throw new Error("Failed to get a user with id: " + id);
  });
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeCreate
 * path: /challenge/{username}
 *
 */
export const challengeUser = (
  username: string,
  request: RequesChallengeCreate
) => {
  const post = getPoster();
  return post(ChallengeJsonZ, apiUrl(`/challenge/${username}`), request);
};

/**
 * doc: https://lichess.org/api#tag/Challenges/operation/challengeAi
 * path: /challenge/ai
 *
 */
export const challengeLichessAI = (request: RequesChallengeCreateAI) => {
  const post = getPoster();
  return post(ChallengeJsonZ, apiUrl(`/challenge/ai`), request);
};

/**
 * doc: https://lichess.org/api#tag/Users/operation/apiUsersStatus
 * path: /users/status
 *
 */
export const userStatus = (usernames: string[]) => {
  const fetch = getFetch();
  return fetch(
    RealTimeUserStatusZ.array(),
    withQueryString(apiUrl(`/users/status`), {
      ids: usernames.join(","),
    })
  );
};

export const __ping = () => {
  return fetch([get("lichess/host"), "__ping"].join("/"), {
    mode: "no-cors",
    cache: "default",
    redirect: "follow",
    credentials: "same-origin",
  });
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/apiBoardSeek
 * path: /board/seek
 */
export const postSeek = (seek: RequestSeekClock, onClose: () => void) => {
  const config = getMutable("lichess/user");
  if (config) {
    return new Promise<() => void>((resolve, _reject) => {
      const stream = config.streamer(
        ResponseIdZ,
        apiUrl("/board/seek"),
        (cancel) => {
          resolve(cancel);
        },
        {
          ...defaultPostOptions(),
          body: encodeQueryString(seek),
        }
      );
      stream.onClose(onClose);
    });
  }
  return Promise.reject("no-config");
};

/**
 * doc: https://lichess.org/api#tag/Board/operation/boardGameAbort
 * path: /board/game/{gameId}/abort
 */
export const postAbort = (gameId: string) => {
  const post = getPoster();
  return post(ResponseOkZ, apiUrl(`/board/game/${gameId}/abort`), {});
};

/**
 * doc: https://lichess.org/api#tag/Arena-tournaments/operation/apiTournament
 * path: /tournament
 *
 */
export const getArenaTournaments = () =>
  getFetch()(ArenaTournamentResponseZ, apiUrl("/tournament"));

/**
 * doc: https://lichess.org/api#tag/Arena-tournaments/operation/apiTournamentJoin
 * path: /tournament/{id}/join
 */
export const postArenaTournamentJoin = (id: string) => {
  const post = getPoster();
  return post(ResponseOkZ, apiUrl(`/tournament/${id}/join`), {
    pairMeAsap: true,
  });
};
