"use client";

import { CalendarView } from "@/components/calendar-view";

export default function RecordPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">몸무게 기록</h1>
      <CalendarView />
    </div>
  );
}
