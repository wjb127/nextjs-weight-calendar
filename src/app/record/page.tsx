"use client";

import { CalendarView } from "@/components/calendar-view";
import { Scale } from "lucide-react";

export default function RecordPage() {
  return (
    <div className="p-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/25">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">몸무게 기록</h1>
          <p className="text-sm text-muted-foreground">날짜를 터치해서 기록하세요</p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}
