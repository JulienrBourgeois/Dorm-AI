"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";
import { signOutUser } from "@/app/lib/firebase/auth";

type InspectionStatus = "scheduled" | "in-progress" | "completed";

type InspectorPortalView =
  | "home"
  | "inbox"
  | "inspections"
  | "execution"
  | "review"
  | "damage"
  | "settings";

type InspectionSection = {
  id: string;
  title: string;
  items: string[];
};

type Inspection = {
  id: string;
  buildingName: string;
  roomLabel: string;
  status: InspectionStatus;
  scheduledAtLabel: string;
  sections: InspectionSection[];
};

type InboxItem = {
  id: string;
  title: string;
  body: string;
  kind: "reminder" | "assignment" | "confirmation";
  createdAtLabel: string;
};

type ReviewSnapshot = {
  inspection: Inspection;
  checkedMap: Record<string, boolean>;
  note: string;
  fileCount: number;
  completedLabel: string;
};

type DamageDraft = {
  damageType: string;
  location: string;
  description: string;
  severity: "low" | "medium" | "high";
  note: string;
  files: File[];
};

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: "insp_1001",
    buildingName: "Maple Hall",
    roomLabel: "Room 2A",
    status: "scheduled",
    scheduledAtLabel: "Today • 9:30 AM",
    sections: [
      { id: "safety", title: "Safety", items: ["Smoke detector functional", "Clear exits"] },
      { id: "appliances", title: "Appliances", items: ["Fridge runs properly", "Stove knobs present"] },
      { id: "general", title: "General", items: ["Walls/ceilings intact", "Flooring free of hazards"] },
    ],
  },
  {
    id: "insp_1002",
    buildingName: "Oak Residence",
    roomLabel: "Room 3B",
    status: "in-progress",
    scheduledAtLabel: "In progress",
    sections: [
      { id: "safety", title: "Safety", items: ["Smoke detector functional", "Clear exits"] },
      { id: "appliances", title: "Appliances", items: ["Fridge runs properly", "Stove knobs present"] },
      { id: "general", title: "General", items: ["Walls/ceilings intact", "Flooring free of hazards"] },
    ],
  },
  {
    id: "insp_1003",
    buildingName: "Cedar Tower",
    roomLabel: "Room 1C",
    status: "completed",
    scheduledAtLabel: "Completed",
    sections: [
      { id: "safety", title: "Safety", items: ["Smoke detector functional", "Clear exits"] },
      { id: "appliances", title: "Appliances", items: ["Fridge runs properly", "Stove knobs present"] },
      { id: "general", title: "General", items: ["Walls/ceilings intact", "Flooring free of hazards"] },
    ],
  },
];

const INITIAL_INBOX: InboxItem[] = [
  {
    id: "inbox_1",
    title: "Reminder: Maple Hall inspection tomorrow",
    body: "Quick checklist review recommended. Bring your evidence kit.",
    kind: "reminder",
    createdAtLabel: "Today • 4:12 PM",
  },
  {
    id: "inbox_2",
    title: "New assignment: Oak Residence • Room 3B",
    body: "Inspection is scheduled for today. Start when you’re on-site.",
    kind: "assignment",
    createdAtLabel: "Yesterday • 9:04 AM",
  },
  {
    id: "inbox_3",
    title: "Completion confirmation: Cedar Tower • Room 1C",
    body: "Your submission was received. Evidence has been queued for review.",
    kind: "confirmation",
    createdAtLabel: "2 days ago",
  },
];

function StatusPill({ status }: { status: InspectionStatus }) {
  const cls =
    status === "scheduled"
      ? "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800"
      : status === "in-progress"
        ? "bg-accent/10 text-accent ring-accent/20"
        : "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {status === "scheduled" ? "Scheduled" : status === "in-progress" ? "In progress" : "Completed"}
    </span>
  );
}

export default function InspectorPortalPage() {
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const [view, setView] = useState<InspectorPortalView>("home");
  const [inbox] = useState<InboxItem[]>(INITIAL_INBOX);
  const [reviewSnapshot, setReviewSnapshot] = useState<ReviewSnapshot | null>(null);
  const [damageDraft, setDamageDraft] = useState<DamageDraft>({
    damageType: "",
    location: "",
    description: "",
    severity: "low",
    note: "",
    files: [],
  });

  const activeInspection = useMemo(
    () => inspections.find((i) => i.id === activeInspectionId) ?? null,
    [inspections, activeInspectionId],
  );

  const allChecklistItems = useMemo(() => {
    if (!activeInspection) return [];
    const items: Array<{ key: string; sectionId: string; label: string }> = [];
    for (const section of activeInspection.sections) {
      section.items.forEach((label, idx) => {
        items.push({ key: `${section.id}:${idx}`, sectionId: section.id, label });
      });
    }
    return items;
  }, [activeInspection]);

  const completedCount = useMemo(
    () => allChecklistItems.filter((x) => checkedMap[x.key]).length,
    [allChecklistItems, checkedMap],
  );

  const progressPct = useMemo(() => {
    if (allChecklistItems.length === 0) return 0;
    return Math.round((completedCount / allChecklistItems.length) * 100);
  }, [allChecklistItems.length, completedCount]);

  const activeSection = activeInspection?.sections[activeSectionIdx] ?? null;
  const totalSections = activeInspection?.sections.length ?? 0;

  function startInspection(nextId: string) {
    const next = inspections.find((i) => i.id === nextId);
    if (!next) return;

    setInspections((prev) => prev.map((i) => (i.id === nextId ? { ...i, status: "in-progress" } : i)));
    setActiveInspectionId(nextId);
    setCheckedMap({});
    setNote("");
    setSelectedFiles([]);
    setActiveSectionIdx(0);
    setView("execution");
  }

  function finishInspection() {
    if (!activeInspection) return;

    setReviewSnapshot({
      inspection: activeInspection,
      checkedMap: { ...checkedMap },
      note,
      fileCount: selectedFiles.length,
      completedLabel: "Today • just now",
    });

    setInspections((prev) => prev.map((i) => (i.id === activeInspection.id ? { ...i, status: "completed" } : i)));
    setActiveInspectionId(null);
    setCheckedMap({});
    setNote("");
    setSelectedFiles([]);
    setActiveSectionIdx(0);
    setView("review");
    toast.success("Inspection completed (wireframe).");
  }

  function toggleChecked(sectionId: string, itemIdx: number) {
    const key = `${sectionId}:${itemIdx}`;
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(next);
  }

  function handleSave() {
    toast.success("Saved progress (wireframe).");
  }

  function handleNextSection() {
    if (!activeInspection) return;
    setActiveSectionIdx((i) => Math.min(i + 1, activeInspection.sections.length - 1));
  }

  function handlePrevSection() {
    if (!activeInspection) return;
    setActiveSectionIdx((i) => Math.max(i - 1, 0));
  }

  async function handleSignOut() {
    await signOutUser();
  }

  const activeSectionCanFinish =
    Boolean(activeInspection) && activeSectionIdx >= Math.max(0, totalSections - 1);

  const viewLabel =
    view === "home"
      ? "Inspector Home"
      : view === "inbox"
        ? "Inspector Inbox"
        : view === "inspections"
          ? "Inspections Queue"
          : view === "execution"
            ? "Inspection Execution"
            : view === "review"
              ? "Inspection Review"
              : view === "damage"
                ? "New Damage Reporting"
                : "Settings";

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-sm">
              <span className="text-xs font-bold text-white">D</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspector Portal</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{viewLabel}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </header>

      {view !== "execution" && (
        <div className="mx-auto max-w-6xl px-6 pb-1 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pt-3">
            <button
              type="button"
              onClick={() => setView("home")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                view === "home"
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setView("inbox")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                view === "inbox"
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => setView("inspections")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                view === "inspections"
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Inspections
            </button>
            <button
              type="button"
              onClick={() => setView("settings")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                view === "settings"
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[360px_1fr] lg:px-10">
        {view === "home" && (
          <section className="lg:col-span-2" aria-label="Inspector home">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Today Overview</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Assigned work at a glance</p>
                </div>
                <div className="text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Action-first daily view
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Buildings", value: "6" },
                  { label: "Rooms", value: "18" },
                  { label: "In progress", value: inspections.filter((i) => i.status === "in-progress").length.toString() },
                  { label: "Due soon", value: inspections.filter((i) => i.status === "scheduled").length.toString() },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{c.value}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">In-progress</h3>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Resume when ready
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {inspections.filter((i) => i.status === "in-progress").length === 0 ? (
                      <div className="rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                        No inspections currently running.
                      </div>
                    ) : (
                      inspections
                        .filter((i) => i.status === "in-progress")
                        .slice(0, 2)
                        .map((insp) => (
                          <div key={insp.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-800">
                            <div>
                              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {insp.buildingName} • {insp.roomLabel}
                              </div>
                              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{insp.scheduledAtLabel}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => startInspection(insp.id)}
                              className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-alt"
                            >
                              Resume
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick-start</h3>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Start scheduled work</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {inspections.filter((i) => i.status === "scheduled").slice(0, 2).map((insp) => (
                      <div
                        key={insp.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-800"
                      >
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {insp.buildingName} • {insp.roomLabel}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{insp.scheduledAtLabel}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => startInspection(insp.id)}
                          className="rounded-xl border border-accent bg-white px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/10"
                        >
                          Start
                        </button>
                      </div>
                    ))}

                    {inspections.filter((i) => i.status === "scheduled").length === 0 && (
                      <div className="rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                        No scheduled inspections right now.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Use the queue to start/resume quickly. Mobile-friendly runner UI.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setView("inspections")}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Open inspections queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("inbox")}
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt"
                  >
                    View inbox
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "inbox" && (
          <section className="lg:col-span-2" aria-label="Inspector inbox">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Inspector Inbox</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Reminders and assignment notifications</p>
                </div>
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{inbox.length} items</div>
              </div>

              <div className="mt-5 space-y-3">
                {inbox.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                            item.kind === "assignment"
                              ? "bg-accent/10 text-accent ring-1 ring-accent/20"
                              : item.kind === "confirmation"
                                ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                                : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800"
                          }`}
                        >
                          {item.kind === "reminder"
                            ? "Reminder"
                            : item.kind === "assignment"
                              ? "Assignment"
                              : "Confirmation"}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.createdAtLabel}</div>
                      </div>
                      <div className="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.body}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.kind === "assignment") {
                          toast.success("Opening assignment (wireframe).");
                          setView("inspections");
                        } else {
                          toast.success("Opened message (wireframe).");
                        }
                      }}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === "inspections" && (
          <section className="lg:col-span-2" aria-label="Inspections queue">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Inspections</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Filters and start/resume actions</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Filters + refresh (wireframe).")}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status filters</div>
                  <div className="mt-3 space-y-2">
                    {(["scheduled", "in-progress", "completed"] as InspectionStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toast.success(`Filter: ${s} (wireframe).`)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-left text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        {s === "scheduled" ? "Scheduled" : s === "in-progress" ? "In progress" : "Completed"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Queue</div>
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{inspections.length} items</div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {inspections
                      .slice()
                      .sort((a, b) => (a.status === "in-progress" ? -1 : 1) - (b.status === "in-progress" ? -1 : 1))
                      .map((insp) => (
                        <div
                          key={insp.id}
                          className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                  {insp.buildingName} • {insp.roomLabel}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{insp.scheduledAtLabel}</div>
                              </div>
                              <StatusPill status={insp.status} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {insp.status === "scheduled" || insp.status === "in-progress" ? (
                              <button
                                type="button"
                                onClick={() => startInspection(insp.id)}
                                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt"
                              >
                                {insp.status === "scheduled" ? "Start" : "Resume"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  // Wireframe: open a read-only review stub.
                                  setReviewSnapshot({
                                    inspection: insp,
                                    checkedMap: {},
                                    note: "",
                                    fileCount: 0,
                                    completedLabel: "Completed",
                                  });
                                  setView("review");
                                }}
                                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toast.success("Open details (wireframe).")}
                              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}

                    {inspections.length === 0 && (
                      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No inspections available yet</div>
                        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Refresh or check back later.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "review" && (
          <section className="lg:col-span-2" aria-label="Inspection review">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Review & Submit</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Final checklist + evidence summary</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSnapshot(null);
                      setView("inspections");
                    }}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Back to queue
                  </button>
                </div>
              </div>

              {!reviewSnapshot ? (
                <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No review to submit</div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Finish an inspection to see the review screen.</div>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {reviewSnapshot.inspection.buildingName} • {reviewSnapshot.inspection.roomLabel}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{reviewSnapshot.completedLabel}</div>

                    <div className="mt-4 space-y-4">
                      {reviewSnapshot.inspection.sections.map((section) => (
                        <div key={section.id}>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</div>
                          <div className="mt-2 space-y-2">
                            {section.items.map((label, idx) => {
                              const key = `${section.id}:${idx}`;
                              const checked = Boolean(reviewSnapshot.checkedMap[key]);
                              return (
                                <div key={key} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-black">
                                  <div
                                    className={`h-5 w-5 rounded-md border ${
                                      checked
                                        ? "border-emerald-200 bg-emerald-600"
                                        : "border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                                    }`}
                                  />
                                  <div className="text-sm text-zinc-700 dark:text-zinc-200">{label}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Evidence</div>
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {reviewSnapshot.fileCount === 0 ? "No images attached in this wireframe." : `${reviewSnapshot.fileCount} image(s) attached.`}
                    </div>

                    <div className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI summary preview</div>
                    <div className="mt-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                      Summary will appear here after submission (wireframe).
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes</div>
                      <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                        {reviewSnapshot.note ? reviewSnapshot.note : "No notes entered."}
                      </div>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Submitted inspection (wireframe).");
                          setReviewSnapshot(null);
                          setView("inspections");
                        }}
                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Confirm submission
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {view === "damage" && (
          <section className="lg:col-span-2" aria-label="New damage reporting">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">New Damage Reporting</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Capture evidence for follow-up</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setView("execution")}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Damage details</div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Damage type</label>
                      <input
                        value={damageDraft.damageType}
                        onChange={(e) => setDamageDraft((d) => ({ ...d, damageType: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-black"
                        placeholder="e.g., Broken tile"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Location</label>
                      <input
                        value={damageDraft.location}
                        onChange={(e) => setDamageDraft((d) => ({ ...d, location: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-black"
                        placeholder="e.g., Kitchen sink cabinet"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Description</label>
                      <textarea
                        value={damageDraft.description}
                        onChange={(e) => setDamageDraft((d) => ({ ...d, description: e.target.value }))}
                        className="mt-2 min-h-[110px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-black"
                        placeholder="Add details for maintenance teams"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Severity & photos</div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Severity</label>
                      <select
                        value={damageDraft.severity}
                        onChange={(e) => setDamageDraft((d) => ({ ...d, severity: e.target.value as DamageDraft["severity"] }))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-black"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Optional note</label>
                      <input
                        value={damageDraft.note}
                        onChange={(e) => setDamageDraft((d) => ({ ...d, note: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-black"
                        placeholder="Additional context"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Photo upload</label>
                      <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                        <span>{damageDraft.files.length === 0 ? "Attach photos" : `${damageDraft.files.length} photo(s)`}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const next = e.target.files ? Array.from(e.target.files) : [];
                            setDamageDraft((d) => ({ ...d, files: next }));
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Damage record created (wireframe).");
                        setDamageDraft({
                          damageType: "",
                          location: "",
                          description: "",
                          severity: "low",
                          note: "",
                          files: [],
                        });
                        setView("execution");
                      }}
                      className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-alt"
                    >
                      Create damage record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "settings" && (
          <section className="lg:col-span-2" aria-label="Inspector settings">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Inspector Settings</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Profile, notifications, and sign out</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profile info</div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Wireframe placeholders for name, campus, and contact details.
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                      onClick={() => toast.success("Update profile (wireframe).")}
                    >
                      Update preferences
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notifications</div>
                  <div className="mt-2 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <span>Email reminders</span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">On</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <span>Assignment alerts</span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">On</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt"
                      onClick={() => toast.success("Save notifications (wireframe).")}
                    >
                      Save settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "execution" && (
          <>
        <section aria-label="Inspection queue">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Inspection Queue</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Tap an inspection to start</p>
              </div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{inspections.length} assigned</div>
            </div>

            <div className="mt-5 space-y-3">
              {inspections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                  <div className="font-semibold">No assigned inspections right now</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Check your schedule or refresh.</div>
                  <button
                    type="button"
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => toast.success("Refresh schedule (wireframe).")}
                  >
                    Refresh schedule
                  </button>
                </div>
              ) : (
                inspections
                  .slice()
                  .sort((a, b) => (a.status === "in-progress" ? -1 : 1) - (b.status === "in-progress" ? -1 : 1))
                  .map((insp) => {
                    const isActive = insp.id === activeInspectionId;
                    const disabled = insp.status === "completed";
                    return (
                      <button
                        key={insp.id}
                        type="button"
                        onClick={() => startInspection(insp.id)}
                        disabled={disabled}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          isActive
                            ? "border-primary/40 bg-primary/5"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        } ${disabled ? "cursor-not-allowed opacity-60 hover:bg-transparent" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {insp.buildingName} • {insp.roomLabel}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{insp.scheduledAtLabel}</div>
                          </div>
                          <StatusPill status={insp.status} />
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>
        </section>

        <section aria-label="Inspection runner">
          <div className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-black">
            {activeInspection ? (
              <div className="flex min-h-[560px] flex-col">
                <div className="sticky top-[73px] border-b border-zinc-200 bg-white/95 px-6 py-5 dark:border-zinc-800 dark:bg-black/90">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {activeInspection.buildingName} • {activeInspection.roomLabel}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Progress: {progressPct}%</div>
                    </div>
                    <StatusPill status={progressPct >= 100 ? "completed" : "in-progress"} />
                  </div>

                  <div className="mt-4 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${progressPct}%` }} aria-hidden />
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-auto px-6 py-5">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {activeSection?.title ?? "Checklist"}
                      </h3>
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        Section {activeSectionIdx + 1} of {totalSections}
                      </div>
                    </div>

                    {activeSection ? (
                      <div className="mt-3 space-y-3">
                        {activeSection.items.map((label, idx) => {
                          const key = `${activeSection.id}:${idx}`;
                          const checked = Boolean(checkedMap[key]);
                          return (
                            <label
                              key={key}
                              className="flex items-start gap-3 rounded-xl border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleChecked(activeSection.id, idx)}
                                className="mt-1 h-4 w-4 accent-[#0ea5e9]"
                              />
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">No section selected.</div>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inline note & evidence</div>
                    <div className="mt-3">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a quick note for this section…"
                        className="min-h-[92px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-accent dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                      />
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-200">
                        <span>Upload images</span>
                        <input type="file" multiple onChange={handleFilesChange} className="hidden" />
                      </label>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {selectedFiles.length === 0 ? "No images selected" : `${selectedFiles.length} file(s) selected`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-200 bg-white/95 px-4 py-4 dark:border-zinc-800 dark:bg-black/90">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tip: keep the flow short on mobile (sticky header + action bar)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => setView("damage")}
                        className="rounded-xl border border-accent bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 dark:border-accent"
                      >
                        Report damage
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevSection}
                        disabled={activeSectionIdx === 0}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Prev
                      </button>

                      {!activeSectionCanFinish ? (
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-alt"
                        >
                          Next section
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={finishInspection}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                        >
                          Finish inspection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
                <div className="w-full max-w-md rounded-2xl border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-800 dark:bg-black">
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No assigned inspections right now</div>
                  <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Pick something from the queue to start the runner.</div>
                  <button
                    type="button"
                    className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => toast.success("Refresh schedule (wireframe).")}
                  >
                    Refresh schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}

