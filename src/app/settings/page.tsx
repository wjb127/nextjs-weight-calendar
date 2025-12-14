"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Target, Ruler, Download, Trash2, Loader2, CheckCircle } from "lucide-react";
import { Settings } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setSettings(data);
        setTargetWeight(data.target_weight?.toString() || "");
        setHeight(data.height?.toString() || "");
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_weight: targetWeight ? parseFloat(targetWeight) : null,
          height: height ? parseFloat(height) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("저장 실패");
      }

      const data = await response.json();
      setSettings(data);
      toast.success("설정이 저장되었습니다");
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateBMI = () => {
    if (!height || !targetWeight) return null;
    const heightM = parseFloat(height) / 100;
    const weight = parseFloat(targetWeight);
    if (heightM <= 0 || weight <= 0) return null;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "저체중", color: "text-blue-500", bg: "bg-blue-50" };
    if (bmi < 23) return { label: "정상", color: "text-green-500", bg: "bg-green-50" };
    if (bmi < 25) return { label: "과체중", color: "text-yellow-500", bg: "bg-yellow-50" };
    return { label: "비만", color: "text-red-500", bg: "bg-red-50" };
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/weights");
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        toast.error("내보낼 데이터가 없습니다");
        return;
      }

      const sortedData = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const csvContent =
        "날짜,몸무게(kg),메모\n" +
        sortedData
          .map(
            (record) =>
              `${record.date},${record.weight},"${record.memo || ""}"`
          )
          .join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weight-records-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSV 파일이 다운로드되었습니다");
    } catch {
      toast.error("내보내기에 실패했습니다");
    }
  };

  const handleResetData = async () => {
    toast.error("이 기능은 아직 구현되지 않았습니다");
    setShowResetDialog(false);
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  if (isLoading) {
    return (
      <div className="p-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">설정</h1>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl shadow-lg shadow-slate-500/25">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-sm text-muted-foreground">목표 및 프로필 관리</p>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-5 space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            프로필 설정
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              목표 몸무게
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="65.0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="tabular-nums text-lg h-12 pr-12 rounded-xl"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              키
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="175.0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="tabular-nums text-lg h-12 pr-12 rounded-xl"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                cm
              </span>
            </div>
          </div>

          {bmi && bmiStatus && (
            <div className={`p-4 rounded-xl ${bmiStatus.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">목표 BMI</p>
                  <p className="text-2xl font-bold tabular-nums">{bmi}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bmiStatus.color} ${bmiStatus.bg}`}>
                  {bmiStatus.label}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                저장
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold mb-4">데이터 관리</h2>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full h-12 justify-start rounded-xl hover:bg-primary/5"
          >
            <Download className="w-5 h-5 mr-3 text-primary" />
            <div className="text-left">
              <p className="font-medium">CSV로 내보내기</p>
              <p className="text-xs text-muted-foreground">모든 기록을 파일로 저장</p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            className="w-full h-12 justify-start rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">모든 데이터 삭제</p>
              <p className="text-xs opacity-70">되돌릴 수 없습니다</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pt-4">
        Weight Calendar v1.0
      </p>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-500">정말 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              모든 몸무게 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-xl">
              취소
            </Button>
            <Button variant="destructive" onClick={handleResetData} className="rounded-xl">
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
