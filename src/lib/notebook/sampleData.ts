// Read-only starter notebooks shown under the "Featured notebooks" tab.
// Selecting one creates an editable copy in the user's own notebooks, so
// there's something to explore on a first visit.

export interface NotebookTemplate {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sources: { title: string; content: string }[];
}

export const templates: NotebookTemplate[] = [
  {
    id: "tpl-weekly-report",
    title: "Weekly Project Report",
    emoji: "📈",
    description: "Turn raw status notes and a metrics table into a clean report, deck, and analysis.",
    sources: [
      {
        title: "Status notes",
        content:
          "This week the team shipped the new onboarding flow and fixed twelve bugs. Sign-ups increased after the landing page redesign. The mobile app crash rate dropped sharply following the latest release. Customer support tickets are trending down as the documentation improves. The main risk is the payment integration, which is still blocked on a vendor review. Next week the focus is the analytics dashboard and a round of usability testing.",
      },
      {
        title: "Weekly metrics",
        content:
          "Week,Signups,Active Users,Tickets\nWeek 1,120,540,38\nWeek 2,138,602,31\nWeek 3,166,690,27\nWeek 4,205,812,22",
      },
    ],
  },
  {
    id: "tpl-study",
    title: "Study Set: Photosynthesis",
    emoji: "🌱",
    description: "Drop in lecture notes and generate a study guide, flashcards, and a quiz.",
    sources: [
      {
        title: "Lecture notes",
        content:
          "Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll is the green pigment that absorbs light, mainly in the red and blue wavelengths. The light-dependent reactions take place in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose. Stomata are pores that allow gas exchange and control water loss. Oxygen is released as a by-product of splitting water molecules.",
      },
    ],
  },
];
