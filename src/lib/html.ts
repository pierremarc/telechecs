import { attrs, emptyElement } from "./dom.js";
import { isOption, map, Option } from "./option.js";

export interface HTMLTags {
  a: HTMLAnchorElement;
  abbr: HTMLElement;
  address: HTMLElement;
  area: HTMLAreaElement;
  article: HTMLElement;
  aside: HTMLElement;
  audio: HTMLAudioElement;
  b: HTMLElement;
  base: HTMLBaseElement;
  bdi: HTMLElement;
  bdo: HTMLElement;
  big: HTMLElement;
  blockquote: HTMLElement;
  body: HTMLBodyElement;
  br: HTMLBRElement;
  button: HTMLButtonElement;
  canvas: HTMLCanvasElement;
  caption: HTMLElement;
  cite: HTMLElement;
  code: HTMLElement;
  col: HTMLTableColElement;
  colgroup: HTMLTableColElement;
  data: HTMLElement;
  datalist: HTMLDataListElement;
  dd: HTMLElement;
  del: HTMLElement;
  details: HTMLElement;
  dfn: HTMLElement;
  dialog: HTMLElement;
  div: HTMLDivElement;
  dl: HTMLDListElement;
  dt: HTMLElement;
  em: HTMLElement;
  embed: HTMLEmbedElement;
  fieldset: HTMLFieldSetElement;
  figcaption: HTMLElement;
  figure: HTMLElement;
  footer: HTMLElement;
  form: HTMLFormElement;
  h1: HTMLHeadingElement;
  h2: HTMLHeadingElement;
  h3: HTMLHeadingElement;
  h4: HTMLHeadingElement;
  h5: HTMLHeadingElement;
  h6: HTMLHeadingElement;
  head: HTMLElement;
  header: HTMLElement;
  hgroup: HTMLElement;
  hr: HTMLHRElement;
  html: HTMLHtmlElement;
  i: HTMLElement;
  iframe: HTMLIFrameElement;
  img: HTMLImageElement;
  input: HTMLInputElement;
  ins: HTMLModElement;
  kbd: HTMLElement;
  keygen: HTMLElement;
  label: HTMLLabelElement;
  legend: HTMLLegendElement;
  li: HTMLLIElement;
  link: HTMLLinkElement;
  main: HTMLElement;
  map: HTMLMapElement;
  mark: HTMLElement;
  menu: HTMLElement;
  menuitem: HTMLElement;
  meta: HTMLMetaElement;
  meter: HTMLElement;
  nav: HTMLElement;
  noscript: HTMLElement;
  // object: HTMLObjectElement;
  ol: HTMLOListElement;
  optgroup: HTMLOptGroupElement;
  option: HTMLOptionElement;
  output: HTMLElement;
  p: HTMLParagraphElement;
  param: HTMLParamElement;
  picture: HTMLElement;
  pre: HTMLPreElement;
  progress: HTMLProgressElement;
  q: HTMLQuoteElement;
  rp: HTMLElement;
  rt: HTMLElement;
  ruby: HTMLElement;
  s: HTMLElement;
  samp: HTMLElement;
  script: HTMLScriptElement;
  section: HTMLElement;
  select: HTMLSelectElement;
  small: HTMLElement;
  source: HTMLSourceElement;
  span: HTMLSpanElement;
  strong: HTMLElement;
  style: HTMLStyleElement;
  sub: HTMLElement;
  summary: HTMLElement;
  sup: HTMLElement;
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;
  td: HTMLTableCellElement;
  textarea: HTMLTextAreaElement;
  tfoot: HTMLTableSectionElement;
  th: HTMLTableCellElement;
  thead: HTMLTableSectionElement;
  time: HTMLElement;
  title: HTMLTitleElement;
  tr: HTMLTableRowElement;
  track: HTMLTrackElement;
  u: HTMLElement;
  ul: HTMLUListElement;
  var: HTMLElement;
  video: HTMLVideoElement;
  wbr: HTMLElement;
}

const createBase = <T extends keyof HTMLTags>(tag: T): HTMLTags[T] =>
  document.createElement(tag) as HTMLTags[T];

export const appendText = (text: string) => (node: HTMLElement) => {
  return node.appendChild(document.createTextNode(text));
};

export type BaseNode = Element | HTMLElement | string | number;

export type AcNode = BaseNode | Option<BaseNode>;

const createWithClass = <T extends keyof HTMLTags>(
  tag: T,
  className: string
) => {
  const node = createBase(tag);
  node.setAttribute("class", className);
  return node;
};

const appendLiteral = (node: HTMLElement) => (value: string | number) => {
  if (typeof value === "number") {
    appendText(value.toLocaleString())(node);
  } else {
    appendText(value)(node);
  }
};

const appendElement = (node: HTMLElement) => (value: HTMLElement | Element) => {
  node.appendChild(value);
};

const appendBaseNode = (node: HTMLElement, value: BaseNode) => {
  if (typeof value === "number" || typeof value === "string") {
    appendLiteral(node)(value);
  } else {
    appendElement(node)(value);
  }
};

export const appendNode = (node: HTMLElement) => (value: AcNode) => {
  if (isOption(value)) {
    map((inner: BaseNode) => appendBaseNode(node, inner))(value);
  } else {
    appendBaseNode(node, value);
  }
};

export const replaceNodeContent =
  (node: HTMLElement) =>
  (...values: AcNode[]) => {
    const append = appendNode(node);
    emptyElement(node);
    values.forEach(append);
  };

export const hasClass =
  (c: string) =>
  <T extends Element>(node: T) =>
    node.classList.contains(c);

export const addClass =
  (...c: string[]) =>
  <T extends Element>(node: T) => {
    node.classList.add(...c);
    return node;
  };

export const removeClass =
  (...c: string[]) =>
  <T extends Element>(node: T) => {
    node.classList.remove(...c);
    return node;
  };

export const toggleClass =
  (c: string) =>
  <T extends Element>(node: T) => {
    node.classList.contains(c)
      ? node.classList.remove(c)
      : node.classList.add(c);
    return node;
  };

const createWithChildren = <T extends keyof HTMLTags>(
  tag: T,
  className: string,
  ns: AcNode[]
) => {
  const node = createWithClass(tag, className);
  ns.forEach(appendNode(node));
  return node;
};

export const DIV = (className: string, ...ns: AcNode[]) =>
  createWithChildren("div", className, ns);

export const SPAN = (className: string, ...ns: AcNode[]) =>
  createWithChildren("span", className, ns);

export const LABEL = (className: string, ...ns: AcNode[]) =>
  createWithChildren("label", className, ns);

export const FIELDSET = (className: string, ...ns: AcNode[]) =>
  createWithChildren("fieldset", className, ns);

export const H1 = (className: string, ...ns: AcNode[]) =>
  createWithChildren("h1", className, ns);

export const H2 = (className: string, ...ns: AcNode[]) =>
  createWithChildren("h2", className, ns);

export const H3 = (className: string, ...ns: AcNode[]) =>
  createWithChildren("h3", className, ns);

export const BUTTON = (className: string, ...ns: AcNode[]) =>
  createWithChildren("button", className, ns);

export const SUPERSCRIPT = (className: string, ...ns: AcNode[]) =>
  createWithChildren("sup", className, ns);

export const TEXTAREA = (className: string, ...ns: AcNode[]) =>
  createWithChildren("textarea", className, ns);

export const PRE = (className: string, ...ns: AcNode[]) =>
  createWithChildren("pre", className, ns);

export type InputType =
  | "checkbox"
  | "date"
  | "button"
  | "email"
  | "color"
  | "hidden"
  | "datetime-local"
  | "month"
  | "file"
  | "password"
  | "image"
  | "range"
  | "number"
  | "search"
  | "radio"
  | "tel"
  | "reset"
  | "time"
  | "submit"
  | "week"
  | "text"
  | "url";

export const INPUT = (className: string, inputType: InputType) =>
  attrs(createWithClass("input", className), (set) => set("type", inputType));

export const ANCHOR = (className: string, href: string, ...ns: AcNode[]) =>
  attrs(createWithChildren("a", className, ns), (set) => set("href", href));

export const IMG = (className: string, src: string) => {
  const el = createWithClass("img", className);
  el.setAttribute("src", src);
  return el;
};

export const CANVAS = (className: string, width: number, height: number) =>
  attrs(createWithClass("canvas", className), (set) => {
    set("width", width);
    set("height", height);
  });

export const IFRAME = (className: string, src: string) =>
  attrs(createWithClass("iframe", className), (set) => {
    set("src", src);
  });

export const AUDIO = (className: string, src: string) =>
  attrs(createWithClass("audio", className), (set) => {
    set("src", src);
  });

export const DETAILS = (
  className: string,
  summary: AcNode,
  ...rest: AcNode[]
) => {
  const details = createWithChildren("details", className, [
    createWithChildren("summary", "", [summary]),
  ]);
  const append = appendNode(details);
  rest.forEach(append);
  return details;
};
