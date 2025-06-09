import { streamFollowing } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { User } from "../lib/ucui/lichess-types";
import { assign, dispatch, get, subscribe } from "../store";

const getFollowing = () => {
  streamFollowing((user) => {
    dispatch("lichess/following", (fs) =>
      fs.filter((f) => f.id !== user.id).concat(user)
    );
    return false;
  });
};

const renderUser = (user: User) =>
  DIV(
    "user",
    events(DIV("username", user.username), (add) =>
      add("click", () => {
        assign("lichess/opponent", user);
        assign("screen", "challenge");
      })
    )
  );

export const mountFollowing = (root: HTMLElement) => {
  getFollowing();
  const users = DIV("users", ...get("lichess/following").map(renderUser));
  const header = DIV("header", DIV("title", `Following`));
  root.append(DIV("follow", header, users));

  subscribe("lichess/following")(() => {
    replaceNodeContent(users)(...get("lichess/following").map(renderUser));
  });
};
