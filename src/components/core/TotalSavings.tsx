"use client";
import { DollarSign } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useGroceryTrips } from "@/hooks/useGroceryTrips";
import { Spinner } from "../Spinner";
import { ItemStatusType } from "@/generated/prisma";

export const TotalSavings = () => {
	const { isLoading, trips } = useGroceryTrips();

	const filteredTrips = trips.reduce(
		(acc, curr) => {
			if (curr.items.length > 0) {
				acc.push({
					totalItems: curr.items.length,
					cost: curr.items.reduce((acc, curr) => acc + curr.price, 0),
					itemsConsumed: curr.items.reduce(
						(total, item) =>
							item.status === ItemStatusType.EATEN
								? total + 1
								: total + item.percentConsumed * 0.01,
						0,
					),
				});
			}
			return acc;
		},
		[] as {
			totalItems: number;
			itemsConsumed: number;
			cost: number;
		}[],
	);

	const averageConsumed =
		filteredTrips.reduce(
			(acc, curr) =>
				acc + curr.itemsConsumed / (curr.totalItems > 0 ? curr.totalItems : 1),
			0,
		) / filteredTrips.length || 0;
	const totalCost = filteredTrips.reduce((total, trip) => total + trip.cost, 0);

	const BASELINE_LOSS = 1 / 3;
	const savingsPercentage = BASELINE_LOSS + averageConsumed;
	const percentageOverBaseline =
		((averageConsumed - BASELINE_LOSS) / BASELINE_LOSS) * 100;
	const averageAmountSaved =
		(totalCost * savingsPercentage) / filteredTrips.length;
	const textColor = ((value: number) => {
		if (value > 25) {
			return "green";
		}
		if (value < 25 && value > -25) {
			return "amber";
		}
		return "red";
	})(percentageOverBaseline);

	const value = Number.isNaN(averageAmountSaved)
		? 0
		: Number.parseFloat(averageAmountSaved.toFixed(2));

	return (
		<Card className="p-6">
			{isLoading ? (
				<Spinner size="sm" className="h center my-8" />
			) : (
				<>
					<div className="flex items-center justify-between space-y-2">
						<h3 className="text-muted-foreground text-sm font-medium">
							Total Savings
						</h3>
						<DollarSign className="text-muted-foreground h-4 w-4" />
					</div>
					<div className="flex items-center gap-2">
						<div className="text-2xl font-bold">${value}</div>
						<Badge
							className={`bg-${textColor}-100 text-${textColor}-800`}
							color={textColor}
						>
							{percentageOverBaseline}%
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">
						Compared to average household
					</p>
				</>
			)}
		</Card>
	);
};
