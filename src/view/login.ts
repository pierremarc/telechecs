import { assign, dispatch, get, subscribe } from "../store";
import { auth, UserConfig } from "../auth";
import { map, orElseL, pipe2 } from ".././lib/option";
import { emptyElement, events } from ".././lib/dom";
import { DIV } from ".././lib/html";
import { once } from ".././lib/util";
import { streamEvent } from "../api";

const authObject = auth();
const init = once(() =>
  authObject.init().then(() => console.log("Auth#init returned"))
);

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

const renderUser = (root: HTMLElement) => (user: UserConfig) => {
  listenEvents();
  emptyElement(root);
  root.append(
    DIV(
      "user",
      user.username,
      events(DIV("navigate", "events"), (add) =>
        add("click", () => assign("screen", "events"))
      )
    )
  );
};

const renderLogin = (root: HTMLElement) => () => {
  emptyElement(root);
  root.append(buttonLogin());
};

export const mountLogin = (root: HTMLElement) => {
  init();

  const withUser = map(renderUser(root));
  const withoutUser = orElseL(renderLogin(root));

  const update = subscribe("lichess/user");
  const remount = () => {
    pipe2(authObject.user(), withUser, withoutUser);
  };

  update(remount);
  remount();
};
