import { fromNullable, map } from "./option";
import { z } from "zod/v4";

const newLine = new RegExp("\n");
type HttpClient = typeof fetch;

const getJSONNDStream = <T>(
  client: HttpClient,
  zt: z.ZodType<T>,
  url: string,
  init?: RequestInit
): Promise<ReadableStreamDefaultReader<T>> =>
  client(url, init)
    .then((response) => response.body)
    .then((responseBody) => {
      if (responseBody == null) {
        throw new Error("Response body is NULL");
      }
      const reader = responseBody.getReader();

      return new ReadableStream({
        start(controller) {
          const decoder = new TextDecoder();
          // The following function handles each data chunk
          const push = () => {
            // "done" is a Boolean and value a "Uint8Array"
            reader.read().then(({ done, value }) => {
              // If there is no more data to read
              if (done) {
                console.log("done", done);
                controller.close();
                return;
              }

              const responseString = decoder.decode(value);

              responseString.split(newLine).map((chunk) => {
                const trimmed = chunk.trim();
                if (trimmed.length > 0) {
                  try {
                    const data = JSON.parse(chunk);
                    const tdata = zt.parse(data);
                    console.log("stream", tdata);
                    controller.enqueue(tdata);
                  } catch (err) {
                    console.error(
                      "Failed to make an object out of chunk:",
                      chunk
                    );
                  }
                }
              });

              push();
            });
          };

          push();
        },
      }).getReader();
    });

// const stream = await getJSONNDStream<{ a: number }>("xxx");

// type UserEvent =
//   | GameStartEvent
//   | GameFinishEvent
//   | ChallengeEvent
//   | ChallengeCanceledEvent
//   | ChallengeDeclinedEvent;

export const streamWith =
  (client: HttpClient) =>
  <T>(zt: z.ZodType<T>, url: string, init?: RequestInit) => {
    type HandlerMessage = (e: T) => boolean;
    type HandlerClose = () => void;
    const onMessageListeners: HandlerMessage[] = [];
    const onCloseListeners: HandlerClose[] = [];
    let queue: T[] = [];

    const readStream = (stream: ReadableStreamDefaultReader<T>) => {
      const readOne = () => {
        stream.read().then(({ done, value }) => {
          dispatchEvent(fromNullable(value));
          if (!done) {
            setTimeout(readOne, 0);
          } else {
            dispatchClose();
          }
        });
      };

      readOne();
    };

    const onMessage = (callback: HandlerMessage): void => {
      if (queue.length > 0) {
        queue.forEach(callback);
        queue = [];
      }
      onMessageListeners.push(callback);
    };
    const onClose = (callback: HandlerClose): void => {
      onCloseListeners.push(callback);
    };

    const dispatchEvent = map((event: T) => {
      if (onMessageListeners.length > 0) {
        onMessageListeners.find((handler) => !handler(event));
      } else {
        queue.push(event);
      }
    });

    const dispatchClose = () => {
      onCloseListeners.forEach((handler) => handler());
    };

    getJSONNDStream(client, zt, url, init)
      .then(readStream)
      .catch(console.error);

    return { onMessage, onClose }; // TODO: onError
  };

export const streamer = streamWith(fetch);
export type Streamer = typeof streamer;
export type Stream = ReturnType<Streamer>;
