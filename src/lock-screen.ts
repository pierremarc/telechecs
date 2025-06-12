import { none, some } from "./lib/option";
import { Nullable, stampEvent } from "./lib/ucui/types";
import { allKeys, assign, dispatchOpt, get, subscribe } from "./store";

const hasLockAPI = "wakeLock" in navigator;

export const screenLocker = () => {
  if (hasLockAPI) {
    // we don't know much about the real screen state
    // so lets listen to whatever moves, except what we're in charge of
    const subAll = subscribe(...allKeys().filter((k) => k !== "lockScreen"));

    let wakeLockSentinel: Nullable<WakeLockSentinel> = null;

    const toggle = (s: boolean) =>
      dispatchOpt("lockScreen", (state) => (state !== s ? some(s) : none));

    const testShouldLock = () => {
      const gameScreen = get("screen") === "game";
      if (gameScreen) {
        if (wakeLockSentinel === null) {
          return true;
        } else {
          return !wakeLockSentinel.released;
        }
      }
      return false;
    };
    const testShouldRelease = () => {
      const notGameScreen = get("screen") !== "game";
      if (notGameScreen && wakeLockSentinel && !wakeLockSentinel.released) {
        return true;
      }
      return false;
    };

    const lockScreen = () => {
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          wakeLockSentinel = sentinel;
          console.log("WakeLock acquired");
          toggle(true);
          wakeLockSentinel.addEventListener("release", () => {
            toggle(false);
            console.log("Navigator released lock sentinel");
          });
        })
        .catch((err) => {
          console.error("failed to lock screen", err);
          assign(
            "lichess/chat",
            stampEvent({
              type: "chatLine",
              room: "spectator",
              username: "Téléchecs",
              text: `Failed to lock screen: ${err}`,
            })
          );
        });
    };

    const release = () => {
      toggle(false);
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        wakeLockSentinel
          .release()
          .then(() => {
            wakeLockSentinel = null;
          })
          .catch((err) => console.error("failed to release wakelock", err));
      }
    };

    const update = () => {
      if (testShouldLock()) {
        lockScreen();
      } else if (testShouldRelease()) {
        release();
      }
    };

    subAll(update);

    update();
  }
};
