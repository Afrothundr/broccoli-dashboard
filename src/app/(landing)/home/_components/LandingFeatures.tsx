"use client";
import {
	Shield,
	Zap,
	Users,
	NotebookText,
	BarChart,
	Rainbow,
} from "lucide-react";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";
import { CardWithIcon } from "@/components/CardWithIcon";
import type { GradientType } from "@/components/CardIcon";
import LandingSectionTitle from "./LandingSectionTitle";

export default function LandingFeatures() {
	const features: {
		icon: typeof BarChart;
		title: string;
		description: string;
		gradient: GradientType;
	}[] = [
		{
			icon: NotebookText,
			title: "Receipt to Results",
			description:
				"Instantly scan your grocery receipts and watch as items are automatically categorized with storage tips and expiration tracking.",
			gradient: "blue",
		},
		{
			icon: Shield,
			title: "Balance your Budget",
			description:
				"See the real financial impact of food waste with customized reports that show exactly how much money you're saving each month.",
			gradient: "green",
		},
		{
			icon: Zap,
			title: "Smart Reminders",
			description:
				"Timely notifications alert you about what needs to be used first, helping you prioritize meals and reduce waste effortlessly.",
			gradient: "amber",
		},
		{
			icon: Users,
			title: "Privacy Protected",
			description:
				"Your shopping habits and kitchen data remain secure with bank-level encryption and a strict no-data-selling commitment.",
			gradient: "purple",
		},
		{
			icon: Rainbow,
			title: "Free Forever",
			description:
				"Open source and free means we won't charge you a dime to save a buck",
			gradient: "indigo",
		},
		{
			icon: BarChart,
			title: "Advanced Analytics",
			description:
				"Comprehensive analytics dashboard with actionable insights to optimize kitchen.",
			gradient: "orange",
		},
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	return (
		<section className="w-full py-20">
			<div className="container mx-auto px-4">
				<LandingSectionTitle
					title={`Why Choose ${APP_NAME}`}
					description="We combine powerful food tracking with intuitive design to deliver an exceptional kitchen management experience."
				/>

				<motion.div
					className="grid grid-cols-1 gap-8 md:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
				>
					{features.map((feature) => (
						<motion.div
							key={feature.gradient}
							variants={itemVariants}
							className="group-md relative"
							whileHover={{ y: -5, transition: { duration: 0.2 } }}
						>
							<CardWithIcon
								icon={feature.icon}
								title={feature.title}
								description={feature.description}
								gradient={feature.gradient}
								descriptionClassName="text-sm"
							/>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
