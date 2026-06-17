// Small inline icons for the Notebook UI. Stroke uses currentColor so they
// inherit text color and adapt to light/dark like the rest of the site.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Base>
);

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Base>
);

export const DocIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Base>
);

export const TableIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </Base>
);

export const ReportIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M4 4h16v16H4z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </Base>
);

export const SlidesIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <line x1="12" y1="16" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </Base>
);

export const MindMapIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M7 12h5M12 12l5-5M12 12l5 5" />
  </Base>
);

export const FlashIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="6" width="14" height="12" rx="1.5" />
    <path d="M7 4h14v12" />
  </Base>
);

export const QuizIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.8.3-1.2.9-1.2 1.6v.5" />
    <line x1="11.5" y1="16.5" x2="11.51" y2="16.5" />
  </Base>
);

export const ChartIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <line x1="4" y1="20" x2="20" y2="20" />
    <rect x="6" y="11" width="3" height="7" />
    <rect x="11" y="7" width="3" height="11" />
    <rect x="16" y="13" width="3" height="5" />
  </Base>
);

export const AudioIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 11v2" />
  </Base>
);

export const VideoIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="2" y="5" width="14" height="14" rx="2" />
    <polygon points="22 7 16 12 22 17 22 7" />
  </Base>
);

export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Base>
);

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Base>
);

export const CopyIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Base>
);

export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Base>
);

export const DotsIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </Base>
);

export const BackIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Base>
);

export const SendIcon = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Base>
);
