import type { Metadata } from "next";
import { NotebookDashboard } from "@/components/notebook/NotebookDashboard";

export const metadata: Metadata = {
  title: "Notebook",
  description:
    "A private, offline workspace to compile reports, organize sources, and run simple analysis — all in your browser, no account, no AI.",
};

export default function NotebookPage() {
  return <NotebookDashboard />;
}
