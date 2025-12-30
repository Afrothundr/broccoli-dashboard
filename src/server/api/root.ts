import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { utImageRouter } from "./routers/utImage";
import { polarRouter } from "./routers/polar";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { groceryTripRouter } from "./routers/groceryTrip";
import { itemTypeRouter } from "./routers/itemType";
import { itemRouter } from "./routers/item";
import { receiptRouter } from "./routers/receipt";
import { notificationRouter } from "./routers/notification";
import { pushSubscriptionRouter } from "./routers/push-subscription";

export const appRouter = createTRPCRouter({
  user: userRouter,
  utImage: utImageRouter,
  polar: polarRouter,
  auth: authRouter,
  admin: adminRouter,
  groceryTrip: groceryTripRouter,
  itemType: itemTypeRouter,
  item: itemRouter,
  receipt: receiptRouter,
  notification: notificationRouter,
  pushSubscription: pushSubscriptionRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
