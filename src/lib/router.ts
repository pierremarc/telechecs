import { fromNullable, map } from "./option.js";
import { second, tuple, Tuple } from "./tuple.js";

interface Stringer {
  toString(): string;
}

export type Pather = Stringer[];
export type Path = string[];
export type RouteParser<R> = (p: Path) => R;
export type RouteEvent<R> = (r: R) => void;
export type Handler = (p: Path) => void;
const defaultRouteParser = <R>(p: R) => p;

// tslint:disable-next-line: variable-name
export const Router = <T extends string>(appName: string) => {
  type InternalT = T | "" | "__null_route__";

  interface Route {
    kind: InternalT;
    path: Path;
  }

  const isRoute = (r: unknown): r is Route =>
    r !== null &&
    r !== undefined &&
    typeof r === "object" &&
    "kind" in r &&
    typeof (r as object & Record<"kind", unknown>).kind === "string" &&
    "path" in r &&
    Array.isArray(r.path) &&
    r.path.every((x) => typeof x === "string");

  const handlers: Tuple<InternalT, Handler>[] = [
    tuple("__null_route__", () => void 0),
  ];

  const cleanPath = (p: Path) =>
    p.reduce((acc, s) => {
      if (s.length > 0) {
        return acc.concat([s]);
      }
      return acc;
    }, [] as Path);

  window.onpopstate = ({ state }: PopStateEvent) => {
    if (isRoute(state)) {
      navigateInternal(state.kind, state.path);
    } else {
      navigateInternal("", []);
    }
  };

  const findHandler = (key: InternalT) =>
    map(second)(fromNullable(handlers.find(([name]) => name === key)));

  const handleRoute = (key: InternalT, path: Path) =>
    map((handler: Handler) => handler(cleanPath(path)))(findHandler(key));

  const pushState = (kind: InternalT, path: Path) => {
    const state: Route = { kind, path };
    const url = [`/${appName}`, kind as string].concat(path).join("/");
    window.history.pushState(state, kind, url);
  };

  const route = <R>(
    r: T,
    e: RouteEvent<R>,
    parser = defaultRouteParser as RouteParser<R>
  ) => {
    handlers.push(tuple(r, (p: Path) => e(parser(p))));
  };

  const home = <R = Path>(
    r: T,
    e: RouteEvent<R>,
    parser = defaultRouteParser as RouteParser<R>
  ) => {
    handlers.push(tuple(r, (p: Path) => e(parser(p))));
  };

  const navigateInternal = (t: InternalT, path: Pather) => {
    const stringPath = path.map((a) => a.toString());
    handleRoute(
      t,
      path.map((a) => a.toString())
    );
    return stringPath;
  };

  const navigate = (t: InternalT, path: Pather) => {
    pushState(t, navigateInternal(t, path));
  };

  const back = () => window.history.back();

  return { home, route, navigate, back };
};

/**
    I know it's rather dry as far as documentation goes, but, well, should be enough
    
    const { route, navigate } = Router<('a' | 'b')>();
    
    route('a', p => logger('route', ...p));
    route('b', p => logger(p), (p) => 1);

    navigate('a', ['foo', 2]);
    >> route foo 2
    navigate('b', []);
    >> 1
 */
