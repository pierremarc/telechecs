import { z } from "zod/v4";

export type ContentType =
  | "none"
  | "application/json"
  | "application/x-www-form-urlencoded";

type EncodableLiteral = string | number | boolean;
type Encodable = EncodableLiteral | EncodableLiteral[];

const encodeComponent = (key: string, value: Encodable): string => {
  if (Array.isArray(value)) {
    return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
  }
  return `${key}=${encodeURIComponent(value)}`;
};

export const encodeQueryString = (attrs: Record<string, Encodable>) =>
  Object.keys(attrs)
    .map((k) => encodeComponent(k, attrs[k]))
    .join("&");

export const withQueryString = (
  url: string,
  attrs: Record<string, Encodable>
) => `${url}?${encodeQueryString(attrs)}`;

const defaultGetOptions = (
  contentType = "application/json" as ContentType
): RequestInit => {
  const headers = new Headers();
  if (contentType !== "none") {
    headers.append("Content-Type", contentType);
  }

  return {
    mode: "cors",
    cache: "default",
    redirect: "follow",
    credentials: "same-origin",
    headers,
  };
};

export const fetchWithClient =
  (client: typeof fetch) =>
  <T>(zt: z.ZodType<T>, url: string, init?: RequestInit) => {
    const options: RequestInit = {
      method: "GET",
      ...defaultGetOptions(),
      ...init,
    };

    return client(url, options)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((obj) => zt.parse(obj));
  };

export const fetchZ = fetchWithClient(fetch);

const defaultPostOptions = (
  contentType = "application/x-www-form-urlencoded" as ContentType
): RequestInit => {
  const headers: Record<string, string> = {};
  if (contentType !== "none") {
    headers["Content-Type"] = contentType;
  }

  return {
    method: "POST",
    mode: "cors",
    cache: "default",
    redirect: "follow",
    credentials: "same-origin",
    headers,
  };
};

export const postWithClient =
  (client: typeof fetch) =>
  <T>(
    zt: z.ZodType<T>,
    url: string,
    data: Record<string, Encodable>,
    init?: RequestInit
  ) => {
    const options: RequestInit = {
      method: "POST",
      body: encodeQueryString(data),
      ...defaultPostOptions(),
      ...init,
    };

    return client(url, options)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((obj) => zt.parse(obj));
  };

export const postZ = postWithClient(fetch);
