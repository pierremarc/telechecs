import { assign, dispatch, get, subscribe } from "../store";
import { UserConfig } from "../lib/ucui/types";
import { map, orElseL, pipe2 } from ".././lib/option";
import { emptyElement, events } from ".././lib/dom";
import { ANCHOR, DIV } from ".././lib/html";
import { streamEvent } from "../api";
import { authObject } from "../auth";

let listening = false;

const listenEvents = () => {
  if (!listening) {
    listening = true;
    const user = get("lichess/user");
    if (user) {
      assign("online", true);
      streamEvent(
        (event) => {
          dispatch("lichess/stream-events", (events) => events.concat(event));
          return true;
        },
        () => {
          listening = false;
          assign("online", false);
          window.setTimeout(listenEvents, 20000);
        }
      );
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

const logout = () =>
  events(DIV("button button-logout", "×"), (add) =>
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
      DIV(
        "username",
        ANCHOR("", `${get("lichess/host")}/@/${user.id}`, user.username)
      ),
      logout()
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
