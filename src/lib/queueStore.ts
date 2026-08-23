import { ScheduledPost } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __trendforgePublishingQueue: ScheduledPost[] | undefined;
}

if (!globalThis.__trendforgePublishingQueue) {
  globalThis.__trendforgePublishingQueue = [];
}

export const publishingQueue: ScheduledPost[] = globalThis.__trendforgePublishingQueue;
