"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "@/types";
import { toast } from "sonner";
import { Target, Ruler, Download, Trash2 } from "lucide-react";
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
    if (!settings?.height || !targetWeight) return null;
    const heightM = settings.height / 100;
    const weight = parseFloat(targetWeight);
    if (heightM <= 0 || weight <= 0) return null;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
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
    // 실제로는 모든 데이터 삭제 API가 필요하지만
    // 여기서는 경고만 표시
    toast.error("이 기능은 아직 구현되지 않았습니다");
    setShowResetDialog(false);
  };

  const bmi = calculateBMI();

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">설정</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">설정</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">프로필 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              목표 몸무게 (kg)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="예: 65.0"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              키 (cm)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="예: 175.0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="tabular-nums"
            />
          </div>

          {bmi && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">목표 BMI</p>
              <p className="text-lg font-bold">{bmi}</p>
              <p className="text-xs text-gray-400">
                {bmi < 18.5
                  ? "저체중"
                  : bmi < 23
                  ? "정상"
                  : bmi < 25
                  ? "과체중"
                  : "비만"}
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">데이터 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV로 내보내기
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            모든 데이터 삭제
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              모든 몸무게 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleResetData}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
