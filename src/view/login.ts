import { assign, dispatch, get, subscribe } from "../store";
import { UserConfig } from "../lib/ucui/types";
import { map, orElseL, pipe2 } from ".././lib/option";
import { attrs, emptyElement, events } from ".././lib/dom";
import { DIV, INPUT, replaceNodeContent } from ".././lib/html";
import { getUserById, streamEvent } from "../api";
import { authObject } from "../auth";
import { User } from "../lib/ucui/lichess-types";

let listening = false;

const listenEvents = () => {
  if (!listening) {
    listening = true;
    const user = get("lichess/user");
    if (user) {
      streamEvent((event) => {
        dispatch("lichess/stream-events", (events) => events.concat(event));
        return true;
      });
    } else {
      listening = false;
    }
  }
};

const buttonLogin = () =>
  events(DIV("button button-login", "login"), (add) =>
    add("click", async () => {
      const notLogged = orElseL(() => {
        authObject.login().then(() => {
          withUser(authObject.user());
        });
      });
      const withUser = map((user: UserConfig) => {
        assign("lichess/user", user);
      });

      pipe2(authObject.user(), withUser, notLogged);
    })
  );

const renderLookupUser = (user: User) =>
  events(DIV("result", user.username), (add) =>
    add("click", () => {
      assign("lichess/opponent", user);
      assign("screen", "challenge");
    })
  );

const lookup = () => {
  const input = attrs(INPUT("", "search"), (set) =>
    set("placeholder", "username")
  );
  const results = DIV("results");
  const submit = events(DIV("button submit", "search"), (add) =>
    add("click", () => {
      const username = input.value;
      getUserById(username).then((users) =>
        replaceNodeContent(results)(...users.map(renderLookupUser))
      );
    })
  );
  return DIV("lookup", DIV("search-block", input, submit), results);
};

const buttonFollow = () =>
  events(DIV("button button-follow", "See Following"), (add) =>
    add("click", () => assign("screen", "follow"))
  );

const logout = () =>
  events(DIV("button button-logout", "logout"), (add) =>
    add("click", () =>
      authObject.logout().then(() => assign("lichess/user", null))
    )
  );

const renderUser = (root: HTMLElement) => (user: UserConfig) => {
  listenEvents();
  emptyElement(root);
  root.append(
    DIV(
      "user",
      DIV("username", user.username),
      logout(),
      buttonFollow(),
      lookup()
    )
  );
};

const renderLogin = (root: HTMLElement) => () => {
  emptyElement(root);
  root.append(buttonLogin());
};

export const mountLogin = (root: HTMLElement) => {
  const withUser = map(renderUser(root));
  const withoutUser = orElseL(renderLogin(root));

  const update = subscribe("lichess/user");
  const remount = () => {
    pipe2(authObject.user(), withUser, withoutUser);
  };

  update(remount);
  remount();
};
