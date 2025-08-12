"use client";
import dayjs from "dayjs";
import { TotalSavings } from "@/components/core/TotalSavings";
import { UsageRate } from "@/components/core/UsageRate";
import { AverageTrip } from "@/components/core/AverageTrip";
import { ItemBreakdown } from "@/components/core/ItemBreakdown";
import { Inventory } from "@/components/core/Inventory";
import { ImageUpload } from "@/components/core/ImageUpload";
import { GroceryTrips } from "@/components/core/GroceryTrips";

export default function AppPage() {
  return (
    <div className="vertical space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#85c941]">
            kitchen breakdown
          </h1>
          <p className="text-muted-foreground">
            {dayjs().format("dddd, MMMM D")}
          </p>
        </div>
        <div className="fixed right-[2rem] bottom-[2rem] z-2 md:relative md:right-0 md:bottom-0">
          <ImageUpload style="floating" />
        </div>
      </div>

      {/* Search */}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TotalSavings />
        <UsageRate />
        <AverageTrip />
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-7 md:grid-rows-[450px_minmax(0,1fr)]">
        {/* Activity Feed */}
        <Inventory />

        {/* Quick Actions */}
        {/* <Card className="col-span-4 md:col-span-3 p-6 md:row-start-1 md:col-start-5">
					<h2 className="mb-6 text-xl font-semibold">Quick Actions</h2>
					<div className="grid grid-cols-2 gap-4">
						<Button className="h-auto flex-col items-start justify-start p-4">
							<div className="bg-[#eff4ec] mb-2 flex h-10 w-10 items-center justify-center rounded-full">
								<Receipt className="text-primary h-5 w-5" />
							</div>
							<div className="space-y-1 text-left">
								<p className="text-background dark:text-foreground text-sm leading-none font-medium">
									New Receipt
								</p>
								<p className="text-background dark:text-muted-foreground text-xs">
									Add a new receipt
								</p>
							</div>
						</Button>

						<Button
							className="h-auto flex-col items-start justify-start p-4"
							variant="outline"
						>
							<div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full">
								<BarChart3 className="text-primary h-5 w-5" />
							</div>
							<div className="space-y-1 text-left">
								<p className="text-sm leading-none font-medium">View Trips</p>
								<p className="text-muted-foreground text-xs">
									Add or edit grocery trips
								</p>
							</div>
						</Button>

						<Button
							className="h-auto flex-col items-start justify-start p-4"
							variant="outline"
						>
							<div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full">
								<Settings className="text-primary h-5 w-5" />
							</div>
							<div className="space-y-1 text-left">
								<p className="text-sm leading-none font-medium">Settings</p>
								<p className="text-muted-foreground text-xs">
									Configure account
								</p>
							</div>
						</Button>
					</div>
				</Card> */}
        <ItemBreakdown />
        <GroceryTrips />
      </div>
    </div>
  );
}
