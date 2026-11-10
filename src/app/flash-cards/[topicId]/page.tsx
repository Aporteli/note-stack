import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlashDeck } from "@/components/flash/FlashDeck";
import { flashListHref } from "@/components/flash/lib/flashHome";
import { getFlashCards, getFlashTopic } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash cards · Note-Stack",
  description: "Write a front and a back, then flip the card.",
};

export default async function FlashTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const { topicId } = await params;
  const { folder } = await searchParams;
  const topic = await getFlashTopic(topicId);
  if (!topic) notFound();

  const cards = await getFlashCards(topic.id);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
      <FlashDeck
        topicId={topic.id}
        topicName={topic.name}
        cards={cards}
        backHref={flashListHref(folder)}
      />
    </main>
  );
}
