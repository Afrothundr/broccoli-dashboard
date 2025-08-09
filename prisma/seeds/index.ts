// @ts-check

import { auth } from "@/server/auth";
import { PrismaClient } from "@/generated/prisma";
import { ITEM_TYPES } from "./item_types";

const prisma = new PrismaClient();

const users: {
	name: string;
	email: string;
	password: string;
	role: "admin" | "user";
	onboarded: boolean;
	verified: boolean;
}[] = [
	{
		name: "Admin Adminovich",
		email: "admin@gmail.com",
		password: "password",
		role: "admin",
		onboarded: true,
		verified: true,
	},
	{
		name: "User 1",
		email: "user1@gmail.com",
		password: "password",
		role: "user",
		onboarded: true,
		verified: true,
	},
	{
		name: "User 2",
		email: "user2@gmail.com",
		password: "password",
		role: "user",
		onboarded: false,
		verified: true,
	},
	{
		name: "User 3",
		email: "user3@gmail.com",
		password: "password",
		role: "user",
		onboarded: false,
		verified: false,
	},
];

await (async function main() {
	const [admin, user1, user2, user3] = await Promise.all(
		users.map(async (user) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: user.email },
			});
			if (existingUser) return;
			const res = await auth.api.signUpEmail({
				body: {
					name: user.name,
					email: user.email,
					password: user.password,
				},
			});

			await prisma.user.update({
				where: {
					id: res.user.id,
				},
				data: {
					role: user.role,
					emailVerified: user.verified,
					onboarded: user.onboarded,
				},
			});

			await prisma.groceryTrip.create({
				data: {
					name: "Sample Grocery Trip",
					user: {
						connect: { id: res.user.id },
					},
				},
			});

			return res;
		}),
	);

	for (const item of Object.values(ITEM_TYPES)) {
		await prisma.itemType.upsert({
			where: { name: item.name },
			update: { ...item },
			create: { ...item },
		});
	}
})();
