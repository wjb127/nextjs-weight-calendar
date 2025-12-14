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
import { Trash2, Scale, FileText, Loader2 } from "lucide-react";
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

  const isToday = date?.toDateString() === new Date().toDateString();

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
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            {isToday && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                오늘
              </span>
            )}
            {existingRecord && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                기록됨
              </span>
            )}
          </div>
          <DialogTitle className="text-xl">
            {date ? formatDisplayDate(date) : "몸무게 기록"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Scale className="w-4 h-4" />
              몸무게
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="500"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-3xl font-bold tabular-nums h-16 pr-12 text-center rounded-xl border-2 focus:border-primary transition-colors"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              메모 (선택)
            </label>
            <Input
              type="text"
              placeholder="예: 아침 공복, 운동 후..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          {existingRecord && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
              className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !weight}
            className="rounded-xl min-w-[80px] bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
