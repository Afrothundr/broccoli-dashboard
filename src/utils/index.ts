import { type Item, type ItemType, ItemStatusType } from "@/generated/prisma";
import axios from "axios";

export async function queueItemUpdates(item?: Item, itemType?: ItemType) {
  if (item && itemType && itemType.suggested_life_span_seconds > 0) {
    const triggerTimeInMilliseconds =
      Number(itemType.suggested_life_span_seconds) * 1000;
    await Promise.all([
      itemUpdaterQueue({
        ids: [item.id],
        status: ItemStatusType.BAD,
        delay: triggerTimeInMilliseconds,
      }),
      itemUpdaterQueue({
        ids: [item.id],
        status: ItemStatusType.OLD,
        delay: triggerTimeInMilliseconds * (2 / 3),
      }),
    ]);
  }
}

export async function itemUpdaterQueue({
  ids,
  status,
  delay,
}: {
  ids: number[];
  status: ItemStatusType;
  delay: number;
}) {
  return await axios({
    method: "post",
    url: "/items/update",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_SCHEDULER_API_KEY,
    },
    data: {
      ids,
      status,
      delay,
    },
    withCredentials: false,
    baseURL: process.env.NEXT_PUBLIC_SCHEDULER_API_URL,
  });
}

export async function itemRemoverQueue({
  ids,
  delay,
}: {
  ids: number[];
  delay: number;
}) {
  return await axios({
    method: "post",
    url: "/items/remove",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_SCHEDULER_API_KEY,
    },
    data: {
      ids,
      delay,
    },
    withCredentials: false,
    baseURL: process.env.NEXT_PUBLIC_SCHEDULER_API_URL,
  });
}
