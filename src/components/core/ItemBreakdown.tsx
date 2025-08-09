"use client";
import { Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useItemTypes } from "@/hooks/useItemTypes";
import { ChartCardSkeleton } from "../ui/DashboardCardSkeleton";
import { useMemo } from "react";
import { Receipt } from "lucide-react";

export const ItemCategoryColors: Record<string, string> = {
  Vegetables: "#4CAF50",
  Fruit: "#FF9800",
  Other: "#f5deb3",
  Proteins: "#8D6E63",
  "Non-Dairy Milk": "#6495ed",
  Meat: "#F44336",
  Eggs: "#FFF59D",
  Test: "#2196F3",
  Frozen: "#90CAF9",
  Pantry: "#FFCC80",
  Mushrooms: "#795548",
  Dairy: "#FCE4EC",
  Herbs: "#66BB6A",
};

export const ItemBreakdown = () => {
  const { types, isLoading, isPending } = useItemTypes();

  const { pieData, config } = useMemo(() => {
    const pieData: { title: string; value: number; fill: string }[] = [];
    const config: ChartConfig = {};
    const itemCategoryMapper: Record<
      string,
      { name: string; value: number }[]
    > = {};

    for (const itemType of types) {
      if (itemType.items.length) {
        if (itemType.category && itemCategoryMapper[itemType.category]) {
          itemCategoryMapper?.[itemType.category]?.push({
            name: itemType.name,
            value: itemType.items.length,
          });
        } else {
          itemCategoryMapper[itemType.category] = [
            { name: itemType.name, value: itemType.items.length },
          ];
        }
      }
    }

    const totalItems = Object.values(itemCategoryMapper).reduce((acc, curr) => {
      return acc + curr.reduce((total, current) => total + current.value, 0);
    }, 0);

    for (const category in itemCategoryMapper) {
      const categoryValue =
        itemCategoryMapper?.[category]?.reduce(
          (acc, curr) => acc + curr.value,
          0,
        ) ?? 0;
      pieData.push({
        title: category,
        value: (categoryValue / totalItems) * 100,
        fill: ItemCategoryColors[category] ?? "green",
      });
      config[category] = {
        label: category,
        color: ItemCategoryColors[category] ?? "green",
      };
    }
    return { pieData, config };
  }, [types]);

  if (isLoading || isPending) {
    return (
      <ChartCardSkeleton className="col-span-4 md:col-span-3 md:col-start-5 md:row-start-1" />
    );
  }
  return (
    <Card className="col-span-4 p-6 md:col-span-3 md:col-start-5 md:row-start-1">
      <h2 className="mb-6 text-xl font-semibold">Item Breakdown</h2>
      {!pieData.length ? (
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <Receipt className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No items yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            Start tracking your food waste by uploading your first receipt.
            We&apos;ll help you analyze your spending and consumption patterns.
          </p>
        </CardContent>
      ) : (
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <Pie data={pieData} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="title" />}
                className="text-muted-foreground -translate-y-2 flex-wrap gap-2 text-xs [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      )}
    </Card>
  );
};
