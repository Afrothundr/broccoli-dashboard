"use client";
import { Logo } from "@/components/core/Logo";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";

export default function LandingFooter() {
	// Simplified social links
	// const socialLinks = [
	// 	{ icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
	// 	{ icon: <Github className="h-5 w-5" />, href: "#", label: "GitHub" },
	// ];

	return (
		<footer className="mx-auto mt-auto w-full max-w-[var(--container-max-width)] border-t border-gray-200 dark:border-gray-800">
			<div className="container mx-auto px-4 pt-8">
				<motion.div
					className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Logo and description */}
					<div className="col-span-1 md:col-span-4 md:text-center">
						<Logo />
						<p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
							Start saving with {APP_NAME}.
						</p>
						{/* <div className="mt-4 flex space-x-4">
							{socialLinks.map((link, i) => (
								<Link
									key={i}
									href={link.href}
									className="text-gray-500 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									aria-label={link.label}
								>
									{link.icon}
								</Link>
							))}
						</div> */}
					</div>

					{/* Footer navigation - simplified */}
				</motion.div>
			</div>
		</footer>
	);
}
