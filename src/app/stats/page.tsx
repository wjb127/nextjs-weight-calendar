"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatsChart } from "@/components/stats-chart";
import { WeightRecord, Settings } from "@/types";
import { TrendingDown, TrendingUp, Minus, Scale, BarChart3, Target, ArrowUp, ArrowDown } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="p-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">통계</h1>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-12 skeleton rounded-xl" />
          <div className="h-64 skeleton rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">통계</h1>
          <p className="text-sm text-muted-foreground">{getPeriodLabel()} 데이터</p>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-muted/50">
          <TabsTrigger value="daily" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            일간
          </TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            주간
          </TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            월간
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-4 rounded-2xl border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <CardContent className="pt-4 pb-2">
          <StatsChart
            data={filteredRecords}
            period={period}
            targetWeight={settings?.target_weight}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Scale className="w-4 h-4" />
              평균
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {stats.avg > 0 ? (
                <>{stats.avg}<span className="text-base font-normal text-muted-foreground ml-1">kg</span></>
              ) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl border-0 shadow-sm card-hover ${
          stats.change < 0 ? "bg-gradient-to-br from-green-50 to-emerald-50" :
          stats.change > 0 ? "bg-gradient-to-br from-red-50 to-rose-50" : ""
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              {stats.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : stats.change < 0 ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              변화량
            </div>
            <p className={`text-2xl font-bold tabular-nums ${
              stats.change > 0 ? "text-red-500" : stats.change < 0 ? "text-green-500" : ""
            }`}>
              {stats.change !== 0 ? (
                <>{stats.change > 0 ? "+" : ""}{stats.change}<span className="text-base font-normal ml-1">kg</span></>
              ) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <ArrowUp className="w-4 h-4 text-red-400" />
              최고
            </div>
            <p className="text-xl font-bold tabular-nums">
              {stats.max > 0 ? (
                <>{stats.max}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></>
              ) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <ArrowDown className="w-4 h-4 text-green-400" />
              최저
            </div>
            <p className="text-xl font-bold tabular-nums">
              {stats.min > 0 ? (
                <>{stats.min}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></>
              ) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {settings?.target_weight && stats.latest > 0 && (
        <Card className="mt-4 rounded-2xl border-0 shadow-sm bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Target className="w-4 h-4 text-primary" />
              목표까지
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums text-primary">
                {Math.abs(Math.round((stats.latest - settings.target_weight) * 10) / 10)}
                <span className="text-base font-normal ml-1">kg</span>
              </p>
              <span className="text-sm text-muted-foreground">
                {stats.latest > settings.target_weight ? "감량 필요" : "달성!"}
              </span>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, (settings.target_weight / stats.latest) * 100))}%`
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              현재 {stats.latest}kg → 목표 {settings.target_weight}kg
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
