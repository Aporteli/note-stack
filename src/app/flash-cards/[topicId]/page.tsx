import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { FlashDeck } from "@/components/flash/FlashDeck";
import { getFlashCards, getFlashTopic } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash cards · Note-Stack",
  description: "Write a front and a back, then flip the card.",
};

export default async function FlashTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getFlashTopic(topicId);
  if (!topic) notFound();

  const cards = await getFlashCards(topic.id);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <Header wide />
      <FlashDeck topicId={topic.id} topicName={topic.name} cards={cards} />
    </main>
  );
}
