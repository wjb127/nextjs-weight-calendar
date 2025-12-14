"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatsChart } from "@/components/stats-chart";
import { WeightRecord, Settings } from "@/types";
import { TrendingDown, TrendingUp, Minus, Scale } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [recordsRes, settingsRes] = await Promise.all([
          fetch("/api/weights"),
          fetch("/api/settings"),
        ]);

        const recordsData = await recordsRes.json();
        const settingsData = await settingsRes.json();

        if (Array.isArray(recordsData)) {
          setRecords(recordsData);
        }
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredRecords = (): WeightRecord[] => {
    if (!records.length) return [];

    const now = new Date();
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (period === "daily") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sortedRecords.filter(
        (r) => new Date(r.date) >= sevenDaysAgo
      );
    }

    if (period === "weekly") {
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(now.getDate() - 28);
      return sortedRecords.filter(
        (r) => new Date(r.date) >= fourWeeksAgo
      );
    }

    // monthly - 6개월
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    return sortedRecords.filter(
      (r) => new Date(r.date) >= sixMonthsAgo
    );
  };

  const filteredRecords = getFilteredRecords();

  const calculateStats = () => {
    if (!filteredRecords.length) {
      return { avg: 0, max: 0, min: 0, change: 0, latest: 0 };
    }

    const weights = filteredRecords.map((r) => r.weight);
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    const max = Math.max(...weights);
    const min = Math.min(...weights);

    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const first = sorted[0]?.weight || 0;
    const last = sorted[sorted.length - 1]?.weight || 0;
    const change = last - first;

    return {
      avg: Math.round(avg * 10) / 10,
      max: Math.round(max * 10) / 10,
      min: Math.round(min * 10) / 10,
      change: Math.round(change * 10) / 10,
      latest: last,
    };
  };

  const stats = calculateStats();

  const getPeriodLabel = () => {
    switch (period) {
      case "daily":
        return "최근 7일";
      case "weekly":
        return "최근 4주";
      case "monthly":
        return "최근 6개월";
    }
  };

  const ChangeIcon = () => {
    if (stats.change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (stats.change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">통계</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">통계</h1>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">일간</TabsTrigger>
          <TabsTrigger value="weekly">주간</TabsTrigger>
          <TabsTrigger value="monthly">월간</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-sm text-gray-500 mb-2">{getPeriodLabel()}</p>

      <Card className="mb-4">
        <CardContent className="pt-4">
          <StatsChart
            data={filteredRecords}
            period={period}
            targetWeight={settings?.target_weight}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Scale className="w-4 h-4" />
              평균
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {stats.avg > 0 ? `${stats.avg} kg` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <ChangeIcon />
              변화량
            </div>
            <p
              className={`text-2xl font-bold tabular-nums ${
                stats.change > 0
                  ? "text-red-500"
                  : stats.change < 0
                  ? "text-green-500"
                  : ""
              }`}
            >
              {stats.change !== 0
                ? `${stats.change > 0 ? "+" : ""}${stats.change} kg`
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm mb-1">최고</div>
            <p className="text-xl font-bold tabular-nums">
              {stats.max > 0 ? `${stats.max} kg` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm mb-1">최저</div>
            <p className="text-xl font-bold tabular-nums">
              {stats.min > 0 ? `${stats.min} kg` : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {settings?.target_weight && stats.latest > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm mb-1">목표까지</div>
            <p className="text-xl font-bold tabular-nums">
              {Math.round((stats.latest - settings.target_weight) * 10) / 10} kg
            </p>
            <p className="text-sm text-gray-500">
              현재 {stats.latest} kg / 목표 {settings.target_weight} kg
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
