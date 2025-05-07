import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Logo() {
	return (
		<Link href="/" className="inline-block">
			<motion.h1
				className="text-lg font-bold tracking-normal uppercase transition-all duration-200 hover:scale-105  hover:tracking-widest active:scale-95 active:rotate-0 dark:hover:text-white"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.1 }}
			>
				<Image src="/logo.png" alt="Broccoli logo" width="200" height="300" />
			</motion.h1>
		</Link>
	);
}
