import { emptyElement } from "../lib/dom";
import { DIV } from "../lib/html";
import { Message, Nullable } from "../lib/ucui/types";
import { assign, get, subscribe } from "../store";
import { button } from "./buttons";

let timeoutRef: Nullable<number> = null;

const renderMessage = (root: HTMLElement, { body, from }: Message) => {
  emptyElement(root);

  root.classList.remove("hidden");
  root.append(
    DIV("message", DIV("from", from), DIV("text", body)),
    button("close", () => {
      root.classList.add("hidden");
      assign("lichess/chat", null);
    })
  );
  if (timeoutRef !== null) {
    clearTimeout(timeoutRef);
  }
  timeoutRef = window.setTimeout(() => {
    assign("lichess/chat", null);
    root.classList.add("hidden");
    timeoutRef = null;
  }, 4000);
};

export const mountChat = (root: HTMLElement) => {
  const chatBox = DIV("chat-box hidden");
  root.append(chatBox);

  subscribe("lichess/chat")(() => {
    const message = get("lichess/chat");
    if (message) {
      renderMessage(chatBox, message);
    } else {
      emptyElement(chatBox);
    }
  });
};
