import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FlashHome } from "@/components/flash/FlashHome";
import { getFlashFolders, getFlashTopics } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash cards · Note-Stack",
  description: "Group flash cards by topic, then flip them.",
};

export default async function FlashCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const [topics, folders] = await Promise.all([getFlashTopics(), getFlashFolders()]);
  const folderId = folders.some((item) => item.id === folder) ? (folder ?? null) : null;
  if (folder && !folderId) redirect("/flash-cards");

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-paper text-ink">
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-3 py-10 sm:px-3 sm:py-6">
        <FlashHome topics={topics} folders={folders} folderId={folderId} />
      </div>
    </main>
  );
}
