import type { Metadata } from "next";
import Header from "@/components/Header";
import { WeekSchedule } from "@/components/week/WeekSchedule";
import { getWeekSlots } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Week · Note-Stack",
  description: "Plan what you need to do through the week.",
};

export default async function WeekPage() {
  const slots = await getWeekSlots();

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <Header wide />
      <div className="flex min-h-0 w-full flex-1 flex-col px-3 pb-3 sm:px-4">
        <header className="mb-2 shrink-0">
        
        </header>
        <WeekSchedule slots={slots} />
      </div>
    </main>
  );
}
