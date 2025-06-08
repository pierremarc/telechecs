interface ToString {
  toString(): string;
}

export const attrs = <E extends HTMLElement>(
  e: E,
  f: (s: (k: string, v: ToString) => void) => void
) => {
  const set = (k: string, v: ToString) => {
    e.setAttribute(k, v.toString());
  };
  f(set);
  return e;
};

export const events = <E extends HTMLElement>(
  e: E,
  f: (
    s: <K extends keyof HTMLElementEventMap>(
      k: K,
      listener: (ev: HTMLElementEventMap[K]) => void
    ) => void
  ) => void
) => {
  const add = <K extends keyof HTMLElementEventMap>(
    k: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ) => {
    e.addEventListener(k, listener);
  };
  f(add);
  return e;
};

export function emptyElement(elem: Node) {
  while (elem.firstChild) {
    removeElement(elem.firstChild);
  }
  return elem;
}

export function removeElement(elem: Node, keepChildren = false) {
  if (!keepChildren) {
    emptyElement(elem);
  }
  const parent = elem.parentNode;
  if (parent) {
    parent.removeChild(elem);
  }
}
