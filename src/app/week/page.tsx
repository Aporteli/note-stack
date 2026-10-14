import type { Metadata } from "next";
import Header from "@/components/Header";
import { WeekSchedule } from "@/components/week/WeekSchedule";
import { getWeekSlots } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Week · Note-Stack",
  description: "Plan what you need to do each hour of the week.",
};

export default async function WeekPage() {
  const slots = await getWeekSlots();

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <Header wide />
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        <header className="mb-3 shrink-0">
          <p className="text-sm font-medium text-plum">Week</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your week
          </h1>
        </header>
        <WeekSchedule slots={slots} />
      </div>
    </main>
  );
}
