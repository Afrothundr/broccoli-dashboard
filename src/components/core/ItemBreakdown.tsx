"use client";
import { Pie, PieChart, Cell, Sector } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useItemTypes } from "@/hooks/useItemTypes";
import { ChartCardSkeleton } from "../ui/DashboardCardSkeleton";
import { useMemo, useState } from "react";
import { Receipt, TrendingUp } from "lucide-react";
import { ItemCategoryColors } from "@/constants/itemCategories";

// Active shape renderer for interactive pie slices
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        className="fill-foreground text-sm font-semibold"
      >
        {payload.title}
      </text>
      <text
        x={cx}
        y={cy + 10}
        dy={8}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        {`${payload.count} items (${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ItemBreakdown = () => {
  const { types, isLoading, isPending } = useItemTypes();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const { pieData, config, totalItems, topCategory } = useMemo(() => {
    const pieData: {
      title: string;
      value: number;
      count: number;
      fill: string;
    }[] = [];
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
        count: categoryValue,
        fill: ItemCategoryColors[category] ?? "green",
      });
      config[category] = {
        label: category,
        color: ItemCategoryColors[category] ?? "green",
      };
    }

    // Sort by count to find top category
    const sortedData = [...pieData].sort((a, b) => b.count - a.count);
    const topCategory = sortedData[0];

    return { pieData, config, totalItems, topCategory };
  }, [types]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  if (isLoading || isPending) {
    return (
      <ChartCardSkeleton className="col-span-4 md:col-span-3 md:col-start-5 md:row-start-1" />
    );
  }

  return (
    <Card className="col-span-4 md:col-span-3 md:col-start-5 md:row-start-1">
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Item Breakdown</h2>
            {pieData.length > 0 && (
              <p className="text-muted-foreground mt-1 text-sm">
                {totalItems} total items across {pieData.length} categories
              </p>
            )}
          </div>
          {topCategory && (
            <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium">{topCategory.title}</span>
            </div>
          )}
        </div>

        {!pieData.length ? (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Receipt className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No items yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Start tracking your food waste by uploading your first receipt.
              We&apos;ll help you analyze your spending and consumption
              patterns.
            </p>
          </CardContent>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            {/* Chart Section */}
            <CardContent className="flex items-center justify-center pb-0">
              <ChartContainer
                config={config}
                className="mx-auto aspect-square max-h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name, item) => (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{
                                backgroundColor: item.payload.fill,
                              }}
                            />
                            <span className="font-medium">{name}:</span>
                            <span className="text-muted-foreground">
                              {item.payload.count} items (
                              {typeof value === "number"
                                ? value.toFixed(1)
                                : value}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="title"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        className="transition-all duration-200 hover:opacity-80"
                        style={{
                          filter:
                            activeIndex === undefined || activeIndex === index
                              ? "none"
                              : "opacity(0.5)",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>

            {/* Legend Section */}
            <div className="flex flex-col justify-center gap-2 px-6 pb-6 md:px-0 md:pb-0">
              {pieData
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <div
                    key={item.title}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-3 rounded-md p-2 transition-colors"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {item.count}
                      </span>
                      <span className="text-muted-foreground min-w-[3rem] text-right text-xs font-medium">
                        {item.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
