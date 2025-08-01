import { getUserById, streamFollowing, userStatus } from "../api";
import { attrs, events } from "../lib/dom";
import { DIV, INPUT, replaceNodeContent } from "../lib/html";
import { fromNullable, map } from "../lib/option";
import { Perfs, User } from "../lib/ucui/lichess-types";
import { LichessAI } from "../lib/ucui/types";
import tr from "../locale";
import { assign, dispatch, get, subscribe } from "../store";
import { button, name } from "./buttons";

const getFollowing = (root: HTMLElement) => {
  streamFollowing(
    (user) => {
      dispatch("lichess/following", (fs) =>
        fs.filter((f) => f.id !== user.id).concat(user)
      );
      return false;
    },
    async () => {
      const status = await userStatus(
        get("lichess/following").map((u) => u.id)
      );
      for (const s of status) {
        const userElement = root.querySelector(`[data-id="${s.id}"]`);
        if (userElement) {
          if (s.online) {
            userElement.classList.add("online");
          } else {
            userElement.classList.remove("online");
          }
        }
      }
    }
  );
};

const perfs = map(({ classical, rapid }: Perfs) =>
  DIV(
    "perfs",
    DIV(
      "classical",
      `${tr("players/classic")}: ${classical ? classical.rating : "?"}`
    ),
    DIV("rapid", `${tr("players/rapid")}: ${rapid ? rapid.rating : "?"}`)
  )
);

const renderLookupUser = (user: User) =>
  events(
    DIV(
      "result",
      DIV("username", user.username),
      perfs(fromNullable(user.perfs))
    ),
    (add) =>
      add("click", () => {
        assign("lichess/opponent", user);
        assign("screen", "challenge");
      })
  );

const lookup = () => {
  const input = attrs(INPUT("", "search"), (set) =>
    set("placeholder", tr("players/username"))
  );
  const results = DIV("results");
  const submit = events(DIV("button submit", tr("players/search")), (add) =>
    add("click", () => {
      const username = input.value;
      getUserById(username).then((user) =>
        replaceNodeContent(results)(renderLookupUser(user))
      );
    })
  );
  return DIV(
    "lookup",
    DIV("section", DIV("title", tr("players/find"))),
    DIV("search-block", input, submit),
    results
  );
};

const renderUser = (user: User) =>
  attrs(
    DIV(
      "user",
      events(DIV("username", user.username), (add) =>
        add("click", () => {
          assign("lichess/opponent", user);
          assign("screen", "challenge");
        })
      ),
      DIV("activity")
    ),
    (set) => set("data-id", user.id)
  );

const aiButton = (level: LichessAI["level"]) =>
  events(DIV(`level level-${level}`, `${level}`), (add) =>
    add("click", () => {
      assign("lichess/opponent", { _tag: "lichess-ai", level });
      assign("screen", "challenge");
    })
  );

const levels: LichessAI["level"][] = [1, 2, 3, 4, 5, 6, 7, 8];

const renderLichessAI = () =>
  DIV(
    "user lichess-ai",
    DIV("section", tr("players/ai")),
    DIV("levels", DIV("label", tr("players/ai-level")), ...levels.map(aiButton))
  );

export const mountFollowing = (root: HTMLElement) => {
  const users = DIV("users", ...get("lichess/following").map(renderUser));

  const refresh = button(name("↻", "refresh"), () => {
    getFollowing(users);
  });

  const header = DIV("section", DIV("title", tr("players/following")), refresh);
  root.append(DIV("players-inner", header, users, renderLichessAI(), lookup()));

  subscribe("lichess/following")(() => {
    replaceNodeContent(users)(...get("lichess/following").map(renderUser));
  });
  getFollowing(users);
};
