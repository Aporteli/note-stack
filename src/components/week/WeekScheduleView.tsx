"use client";

import type { WeekSlotData } from "@/app/week/actions";
import { useWeekSchedule } from "@/components/week/hooks/useWeekSchedule";
import { WeekMobileDays, WeekToolbar } from "@/components/week/WeekChrome";
import { WeekEditor } from "@/components/week/WeekEditor";
import { WeekGrid } from "@/components/week/WeekGrid";

export function WeekSchedule({ slots, planId }: { slots: WeekSlotData[]; planId: string }) {
  const week = useWeekSchedule(slots, planId);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <WeekToolbar
        filled={week.filled}
        pending={week.pending}
        now={week.now}
        overnight={week.overnight}
        onNow={week.jumpToNow}
        onOvernight={() => week.setOvernight((value) => !value)}
      />
      <WeekMobileDays day={week.day} now={week.now} onDay={week.chooseDay} />
      <WeekGrid
        day={week.day}
        height={week.columnHeight}
        visibleHours={week.visibleHours}
        visibleStart={week.visibleStart}
        now={week.now}
        events={week.events}
        selectedId={week.selectedId}
        gridRef={week.gridRef}
        onDay={week.chooseDay}
        onAdd={week.begin}
        onGesture={week.startGesture}
        onOpen={week.openEvent}
      />
      {week.editorOpen ? (
        <WeekEditor
          day={week.day}
          dayLabel={week.dayLabel}
          startMin={week.startMin}
          endMin={week.endMin}
          color={week.color}
          draft={week.draft}
          copyTo={week.copyTo}
          selectedId={week.selectedId}
          confirmClear={week.confirmClear}
          onClose={() => week.setEditorOpen(false)}
          onStart={(minutes) => week.applyRange(minutes, week.endMin)}
          onEnd={(minutes) => week.applyRange(week.startMin, minutes)}
          onColor={week.chooseColor}
          onDraft={week.changeDraft}
          onCopyTo={week.setCopyTo}
          onCopy={week.copyDay}
          onDelete={week.deleteTask}
          onClear={week.clearDay}
        />
      ) : null}
    </div>
  );
}
