import { __ping } from "./api";
import { DIV } from "./lib/html";
import { assign, get, subscribe } from "./store";

// There's still some experiment to be made here
const timeout = 6000;
const maxTime = 3000;
let interval: null | number = null;

const handler = (onChange: (quality: number) => void) => {
  const source = Date.now();
  __ping()
    .then(() => {
      const total = Date.now() - source;
      const score = Math.max(
        0,
        Math.min(100, 100 - Math.round((total * 100) / maxTime))
      );
      onChange(score);
    })
    .catch(() => onChange(0));
};

const startMonitor = (onChange: (quality: number) => void) => {
  if (interval === null) {
    interval = window.setInterval(() => {
      if (!get("online")) {
        handler(onChange);
      }
    }, timeout);
    window.addEventListener("offline", () => onChange(0));
  }
};

const updateStatus = (q: number) =>
  q > 0 && !get("online")
    ? assign("online", true)
    : q === 0 && get("online")
    ? assign("online", false)
    : void 0;

export const mountOnline = (root: HTMLElement) => {
  startMonitor(updateStatus);

  const elem = DIV(
    "online-status nok",
    DIV("icon"),
    DIV("label", "Currently offline...")
  );
  subscribe("online")(() => {
    const status = get("online");
    if (status && elem.classList.contains("nok")) {
      elem.classList.remove("nok");
      elem.classList.add("ok");
    } else if (!status && elem.classList.contains("ok")) {
      elem.classList.remove("ok");
      elem.classList.add("nok");
    }
  });

  root.append(elem);
};
