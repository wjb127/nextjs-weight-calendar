"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WeightRecord } from "@/types";

interface StatsChartProps {
  data: WeightRecord[];
  period: "daily" | "weekly" | "monthly";
  targetWeight?: number | null;
}

interface ChartData {
  label: string;
  weight: number;
  date: string;
}

export function StatsChart({ data, period, targetWeight }: StatsChartProps) {
  const formatChartData = (): ChartData[] => {
    if (!data.length) return [];

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (period === "daily") {
      return sortedData.slice(-7).map((record) => ({
        label: new Date(record.date).toLocaleDateString("ko-KR", {
          month: "numeric",
          day: "numeric",
        }),
        weight: record.weight,
        date: record.date,
      }));
    }

    if (period === "weekly") {
      const weeklyData: Record<string, { total: number; count: number; date: string }> = {};

      sortedData.forEach((record) => {
        const date = new Date(record.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, count: 0, date: weekKey };
        }
        weeklyData[weekKey].total += record.weight;
        weeklyData[weekKey].count += 1;
      });

      return Object.entries(weeklyData)
        .slice(-4)
        .map(([, value]) => ({
          label: new Date(value.date).toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
          }) + "~",
          weight: Math.round((value.total / value.count) * 10) / 10,
          date: value.date,
        }));
    }

    // monthly
    const monthlyData: Record<string, { total: number; count: number; date: string }> = {};

    sortedData.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, date: monthKey };
      }
      monthlyData[monthKey].total += record.weight;
      monthlyData[monthKey].count += 1;
    });

    return Object.entries(monthlyData)
      .slice(-6)
      .map(([key, value]) => ({
        label: new Date(key + "-01").toLocaleDateString("ko-KR", {
          month: "short",
        }),
        weight: Math.round((value.total / value.count) * 10) / 10,
        date: key,
      }));
  };

  const chartData = formatChartData();

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  const weights = chartData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const yMin = Math.floor(minWeight - 2);
  const yMax = Math.ceil(maxWeight + 2);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`${value} kg`, "몸무게"]}
          labelFormatter={(label) => label}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{
              value: `목표: ${targetWeight}`,
              position: "right",
              fontSize: 10,
              fill: "#ef4444",
            }}
          />
        )}
        <Bar
          dataKey="weight"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
