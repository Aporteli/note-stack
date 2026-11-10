import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDiagram } from "@/app/diagrams/actions/readDiagram";
import { DiagramEditor } from "@/components/diagram/editor/DiagramEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagram · Note-Stack",
  description: "Draw a diagram.",
};

export default async function DiagramEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagram = await readDiagram(id);
  if (!diagram) notFound();

  return <DiagramEditor diagram={diagram} />;
}
