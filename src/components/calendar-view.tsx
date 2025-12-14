"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { WeightInputModal } from "./weight-input-modal";
import { WeightRecord } from "@/types";
import { toast } from "sonner";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<Record<string, WeightRecord>>({});
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<WeightRecord | null>(null);

  const fetchRecords = useCallback(async (year: number, month: number) => {
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
        <div className="text-xs font-semibold text-blue-600 mt-1">
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

  return (
    <div className="calendar-container">
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
