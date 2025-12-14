"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { WeightInputModal } from "./weight-input-modal";
import { WeightRecord } from "@/types";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<Record<string, WeightRecord>>({});
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<WeightRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/weights?year=${year}&month=${month}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const recordMap: Record<string, WeightRecord> = {};
        data.forEach((record: WeightRecord) => {
          recordMap[record.date] = record;
        });
        setRecords((prev) => ({ ...prev, ...recordMap }));
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const year = activeStartDate.getFullYear();
    const month = activeStartDate.getMonth() + 1;
    fetchRecords(year, month);
  }, [activeStartDate, fetchRecords]);

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      const dateStr = value.toISOString().split("T")[0];
      setSelectedRecord(records[dateStr] || null);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (date: string, weight: number, memo?: string) => {
    try {
      const response = await fetch("/api/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, weight, memo }),
      });

      if (!response.ok) {
        throw new Error("저장 실패");
      }

      const savedRecord = await response.json();
      setRecords((prev) => ({ ...prev, [date]: savedRecord }));
      toast.success("저장되었습니다");
    } catch {
      toast.error("저장에 실패했습니다");
      throw new Error("저장 실패");
    }
  };

  const handleDelete = async (date: string) => {
    try {
      const response = await fetch(`/api/weights/${date}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      setRecords((prev) => {
        const newRecords = { ...prev };
        delete newRecords[date];
        return newRecords;
      });
      toast.success("삭제되었습니다");
    } catch {
      toast.error("삭제에 실패했습니다");
      throw new Error("삭제 실패");
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const record = records[dateStr];

    if (record) {
      return (
        <div className="weight-value">
          {record.weight}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const hasRecord = !!records[dateStr];
    const isToday = date.toDateString() === new Date().toDateString();

    let className = "";
    if (hasRecord) {
      className += " has-record";
    }
    if (isToday) {
      className += " is-today";
    }
    return className;
  };

  // 이번 달 기록 수 계산
  const currentMonthRecords = Object.keys(records).filter((date) => {
    const recordDate = new Date(date);
    return (
      recordDate.getMonth() === activeStartDate.getMonth() &&
      recordDate.getFullYear() === activeStartDate.getFullYear()
    );
  }).length;

  return (
    <div className="calendar-container">
      {/* 월간 요약 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <p className="text-sm text-muted-foreground">이번 달 기록</p>
          <p className="text-2xl font-bold tabular-nums">
            {isLoading ? (
              <span className="inline-block w-8 h-8 skeleton rounded" />
            ) : (
              <>{currentMonthRecords}<span className="text-base font-normal text-muted-foreground ml-1">일</span></>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">오늘</p>
          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <Calendar
        onChange={handleDateClick}
        value={selectedDate}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          activeStartDate && setActiveStartDate(activeStartDate)
        }
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale="ko-KR"
        calendarType="gregory"
        formatDay={(locale, date) => date.getDate().toString()}
        minDetail="month"
        prev2Label={null}
        next2Label={null}
        prevLabel={<ChevronLeft className="w-5 h-5" />}
        nextLabel={<ChevronRight className="w-5 h-5" />}
        navigationLabel={({ date }) =>
          date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
        }
      />

      <WeightInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        existingRecord={selectedRecord}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
