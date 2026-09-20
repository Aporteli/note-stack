import { notFound } from "next/navigation";
import { getBoard } from "@/app/actions";
import Board from "@/components/Board/components/Board";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await getBoard(id);
  if (!board) notFound();

  return <Board board={board} />;
}