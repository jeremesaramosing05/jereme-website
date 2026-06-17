import type { Metadata } from "next";
import { NotebookWorkspace } from "@/components/notebook/NotebookWorkspace";

// Notebooks live only in the visitor's browser, so individual notebook pages
// have no server content to index.
export const metadata: Metadata = {
  title: "Notebook",
  robots: { index: false, follow: false },
};

export default async function NotebookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NotebookWorkspace id={id} />;
}
