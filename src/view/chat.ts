import { emptyElement } from "../lib/dom";
import { DIV } from "../lib/html";
import { ChatLineEvent } from "../lib/ucui/lichess-types";
import { assign, get, subscribe } from "../store";
import { button } from "./buttons";

const renderMessage = (root: HTMLElement, event: ChatLineEvent) => {
  emptyElement(root);
  root.classList.remove("hidden");
  root.append(
    DIV("message", DIV("from", event.username), DIV("text", event.text)),
    button("close", () => {
      root.classList.add("hidden");
      assign("lichess/chat", null);
    })
  );
};

export const mountChat = (root: HTMLElement) => {
  const chatBox = DIV("chat-box hidden");
  root.append(chatBox);

  subscribe("lichess/chat")(() => {
    const message = get("lichess/chat");
    if (message) {
      renderMessage(chatBox, message);
    }
  });
};
