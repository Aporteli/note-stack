import type { Metadata } from "next";
import { WeekBoard } from "@/components/week/WeekSchedule";
import { getWeekBoard } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Week · Note-Stack",
  description: "Plan what you need to do through the week.",
};

export default async function WeekPage() {
  const { plans, slots } = await getWeekBoard();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
      <div className="flex min-h-0 w-full flex-1 flex-col px-3 pb-3 sm:px-4">
        <header className="mb-2 shrink-0">
        
        </header>
        <WeekBoard plans={plans} slots={slots} />
      </div>
    </main>
  );
}
