"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { WeightRecord } from "@/types";

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  existingRecord: WeightRecord | null;
  onSave: (date: string, weight: number, memo?: string) => Promise<void>;
  onDelete: (date: string) => Promise<void>;
}

export function WeightInputModal({
  isOpen,
  onClose,
  date,
  existingRecord,
  onSave,
  onDelete,
}: WeightInputModalProps) {
  const [weight, setWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      setWeight(existingRecord.weight.toString());
      setMemo(existingRecord.memo || "");
    } else {
      setWeight("");
      setMemo("");
    }
  }, [existingRecord, isOpen]);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const handleSave = async () => {
    if (!date || !weight) return;

    setIsLoading(true);
    try {
      await onSave(formatDate(date), parseFloat(weight), memo || undefined);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!date || !existingRecord) return;

    setIsLoading(true);
    try {
      await onDelete(formatDate(date));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>
            {date ? formatDisplayDate(date) : "몸무게 기록"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">몸무게 (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="500"
              placeholder="예: 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-lg tabular-nums"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">메모 (선택)</label>
            <Input
              type="text"
              placeholder="예: 아침 공복"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {existingRecord && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !weight}
          >
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
