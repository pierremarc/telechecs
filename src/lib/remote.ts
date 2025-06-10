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
): any => {
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
  <T>(zt: z.ZodType<T>, url: string, init?: any) => {
    const options: any = {
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
): any => {
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
    data: string | Record<string, Encodable>,
    init?: any
  ) => {
    const options: any = {
      method: "POST",
      ...defaultPostOptions(),
      ...init,
    };

    if (typeof data === "string") {
      options.headers["Content-Type"] = "text/plain";
      options.body = data;
    } else {
      options.body = encodeQueryString(data);
    }

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
