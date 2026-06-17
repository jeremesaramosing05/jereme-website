"use client";

import type { ReactNode } from "react";
import { NotebookStoreProvider } from "@/components/notebook/store";

// Client layout so the whole /notebook subtree shares one store instance,
// loaded from (and saved to) the browser's localStorage.
export default function NotebookLayout({ children }: { children: ReactNode }) {
  return <NotebookStoreProvider>{children}</NotebookStoreProvider>;
}
