/**
 * Taken from https://github.com/lichess-org/api-demo/blob/master/src/auth.ts
 */
import { OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";
import { assign, get } from "./store";
import { Nullable, UserConfig, UserConfig_ } from "./lib/ucui/types";
import { streamWith } from "./lib/stream";
import { fromNullable, map, Option } from "./lib/option";
import { basedPath } from "./env";

export const scopes = [
  "board:play",
  "challenge:read",
  "follow:read",
  "tournament:write",
];
export const clientId = `ucui-${location.host}`;
export const clientUrl = `${location.protocol}//${location.host}${basedPath()}`;

const auth = () => {
  const lichessHost = get("lichess/host");
  let userConfig: Nullable<UserConfig_> = null;

  const oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
    onInvalidGrant: console.warn,
  });

  const init = async () => {
    try {
      const accessContext = await oauth.getAccessToken();
      if (accessContext) await authenticate();
    } catch (err) {
      console.error(err);
    }
    if (!userConfig) {
      try {
        const hasAuthCode = await oauth.isReturningFromAuthServer();
        if (hasAuthCode) {
          await authenticate();
          history.replaceState({ auth: true }, "authenticate", clientUrl);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const login = async () => {
    await oauth.fetchAuthorizationCode();
  };

  const logout = async () => {
    if (userConfig)
      await userConfig.httpClient(`${lichessHost}/api/token`, {
        method: "DELETE",
      });
    localStorage.clear();
    userConfig = null;
  };

  const authenticate = async () => {
    const httpClient = oauth.decorateFetchHTTPClient(window.fetch);
    const res = await httpClient(`${lichessHost}/api/account`);
    const config = {
      ...(await res.json()),
      httpClient,
      streamer: streamWith(httpClient),
    };
    if (config.error) throw config.error;
    userConfig = config;
  };

  //   const stream = <T>(zt: z.ZodType<T>, path: string, init?: RequestInit) => {
  //     if (userConfig === null) {
  //       throw new Error("Cannot stream yet, user is not authenticated");
  //     }
  //     return userConfig.streamer(zt, path, init);
  //   };

  const user = (): Option<UserConfig> =>
    map((c: UserConfig_) => ({
      id: c.id,
      username: c.username,
      streamer: c.streamer,
      httpClient: c.httpClient,
    }))(fromNullable(userConfig));

  return { init, login, logout, user };
};

export type Auth = ReturnType<typeof auth>;

export const authObject = auth();

authObject.init().then(() => {
  const updateConfig = map((uc: UserConfig) => assign("lichess/user", uc));
  updateConfig(authObject.user());
});
