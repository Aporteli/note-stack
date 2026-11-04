"use client";

import { useState, useTransition } from "react";
import {
  createWeekPlan,
  renameWeekPlan,
  type WeekPlanData,
  type WeekSlotData,
} from "@/app/week/actions";
import { WeekSchedule } from "@/components/week/WeekScheduleView";

export function WeekBoard({
  plans,
  slots,
}: {
  plans: WeekPlanData[];
  slots: WeekSlotData[];
}) {
  const [list, setList] = useState(plans);
  const [active, setActive] = useState(plans[0]?.id ?? "");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [adding, startAdding] = useTransition();

  function commitRename() {
    const id = editing;
    const text = draftName.trim();
    setEditing(null);
    if (!id || !text) return;
    setList((items) => items.map((item) => (item.id === id ? { ...item, name: text } : item)));
    void renameWeekPlan(id, text);
  }

  function addPlan() {
    startAdding(async () => {
      const created = await createWeekPlan();
      if (!created) return;
      setList((items) => [...items, created]);
      setActive(created.id);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 gap-1 overflow-x-auto">
        {list.map((plan) =>
          editing === plan.id ? (
            <input
              key={plan.id}
              value={draftName}
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") setEditing(null);
              }}
              className="w-28 shrink-0 rounded-md bg-plum px-3 py-1.5 text-sm font-medium text-ink-invert outline-none"
            />
          ) : (
            <button
              key={plan.id}
              type="button"
              onClick={() => {
                if (plan.id !== active) {
                  setActive(plan.id);
                  return;
                }
                setDraftName(plan.name);
                setEditing(plan.id);
              }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                plan.id === active ? "bg-plum text-ink-invert" : "bg-surface text-ink-soft"
              }`}
            >
              {plan.name}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={addPlan}
          disabled={adding}
          className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface disabled:opacity-40"
        >
          New
        </button>
      </div>
      {list.map((plan) => (
        <div key={plan.id} className={plan.id === active ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <WeekSchedule planId={plan.id} slots={slots.filter((slot) => slot.planId === plan.id)} />
        </div>
      ))}
    </div>
  );
}
