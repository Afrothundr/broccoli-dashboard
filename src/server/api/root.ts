import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { utImageRouter } from "./routers/utImage";
import { polarRouter } from "./routers/polar";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { groceryTripRouter } from "./routers/groceryTrip";

export const appRouter = createTRPCRouter({
	user: userRouter,
	utImage: utImageRouter,
	polar: polarRouter,
	auth: authRouter,
	admin: adminRouter,
	groceryTrip: groceryTripRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
