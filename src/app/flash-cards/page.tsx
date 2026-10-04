import type { Metadata } from "next";
import Header from "@/components/Header";
import { FlashDeck } from "@/components/flash/FlashDeck";
import { getFlashCards } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash cards · Note-Stack",
  description: "Write a front and a back, then flip the card.",
};

export default async function FlashCardsPage() {
  const cards = await getFlashCards();

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <Header wide />
      <FlashDeck cards={cards} />
    </main>
  );
}
