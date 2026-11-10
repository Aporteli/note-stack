import type { Metadata } from "next";
import { listDiagrams } from "@/app/diagrams/actions/listDiagrams";
import { DiagramLibrary } from "@/components/diagram/DiagramLibrary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagrams · Note-Stack",
  description: "Draw diagrams with shapes and connectors.",
};

export default async function DiagramsPage() {
  const diagrams = await listDiagrams();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-paper text-ink">
      <DiagramLibrary initial={diagrams} />
    </main>
  );
}
