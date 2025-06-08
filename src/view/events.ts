import { emptyElement } from ".././lib/dom";
import { DIV, H1, PRE } from ".././lib/html";
import { get, subscribe } from "../store";

export const mountEvents = (root: HTMLElement) => {
  const events = DIV("events");
  const title = H1("", "Events");

  const updateEvents = () => {
    emptyElement(events);
    get("lichess/stream-events").forEach((event) =>
      events.append(
        DIV("event"),
        PRE("json", JSON.stringify(event, undefined, 4))
      )
    );
  };
  updateEvents();
  root.append(title, events);

  subscribe("lichess/stream-events")(updateEvents);
};
