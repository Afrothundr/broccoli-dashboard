"use client";
import Link from "next/link";
import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";
import { SmoothLoadImage } from "@/components/SmoothLoadImage";

// Animated avatar group component
const AvatarGroup = ({ avatars }: { avatars: string[] }) => {
	return (
		<div className="flex -space-x-2">
			{avatars.map((avatar, i) => (
				<motion.div
					key={i}
					className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-950"
					initial={{ opacity: 0, x: -10, scale: 0.8 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					transition={{ delay: i * 0.1 + 0.6, duration: 0.3 }}
					whileHover={{ y: -3, zIndex: 10, transition: { duration: 0.2 } }}
				>
					<Image
						src={avatar}
						alt={`User ${i + 1}`}
						fill
						className="object-cover"
					/>
				</motion.div>
			))}
		</div>
	);
};

export default function LandingHero() {
	// Generate DiceBear avatar seeds
	const avatars = [1, 2, 3, 4].map((i) =>
		createAvatar(lorelei, {
			seed: `user-${i}`,
			backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
		}).toDataUri(),
	);

	return (
		<section className="w-full py-12 md:mt-18 md:py-24 lg:py-32">
			<div className="container mx-auto flex flex-col items-center px-4 md:flex-row md:px-6">
				<motion.div
					className="mb-12 flex flex-col items-center space-y-6 text-center md:mb-0 md:w-1/2 md:items-start md:text-left"
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<motion.div
						className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.4 }}
					>
						Introducing {APP_NAME}
					</motion.div>

					<motion.h1
						className="text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.5 }}
					>
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
							maximize
						</span>{" "}
						your kitchen,{" "}
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
							minimize
						</span>{" "}
						your grocery bill
					</motion.h1>

					<motion.p
						className="max-w-md text-lg text-gray-600 dark:text-gray-400"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.5 }}
					>
						Our platform helps track spending habits and food waste saving you
						time and most importantly money.
					</motion.p>

					<motion.div
						className="flex flex-col items-center gap-4 sm:flex-row md:items-start"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4 }}
					>
						<Link
							href="/signup"
							className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-lime-600 px-6 font-medium text-white transition-all duration-300 hover:bg-green-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-500"
						>
							<span className="relative z-10">Get Started Free</span>
						</Link>
					</motion.div>
				</motion.div>

				<motion.div
					className="relative flex justify-center md:w-1/2"
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<div className="relative h-auto min-h-[280px] w-[90%] max-w-[450px]">
						<SmoothLoadImage
							src="/hero.png"
							alt="Dashboard Preview"
							objectFit="contain"
							priority
							className="h-full w-full"
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
