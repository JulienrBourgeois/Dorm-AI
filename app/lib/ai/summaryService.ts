import type { InspectionItem } from "@/types";

export type SummaryGenerationInput = {
  inspectionId: string;
  roomLabel: string;
  inspectionType: string;
  inspectorName: string;
  checklistItems: Array<
    Partial<Pick<InspectionItem, "section" | "prompt" | "response" | "notes">>
  >;
};

export type SummaryGenerationResult = {
  draft: string;
  usedFallback: boolean;
  diagnostics?: string;
};

export interface SummaryGenerator {
  generate(input: SummaryGenerationInput): Promise<SummaryGenerationResult>;
}

function fallbackSummary(roomLabel: string): string {
  return `Inspection completed for ${roomLabel}. Checklist details were captured, but an AI summary is not available yet. Please review checklist items and attached evidence directly.`;
}

export class HeuristicSummaryGenerator implements SummaryGenerator {
  async generate(input: SummaryGenerationInput): Promise<SummaryGenerationResult> {
    if (!input.checklistItems.length) {
      return {
        draft: fallbackSummary(input.roomLabel),
        usedFallback: true,
        diagnostics: "No checklist items found",
      };
    }

    const damaged = input.checklistItems.filter((item) => item.response === "DAMAGED");
    const fair = input.checklistItems.filter((item) => item.response === "FAIR");
    const good = input.checklistItems.filter((item) => item.response === "GOOD");
    const na = input.checklistItems.filter((item) => item.response === "NA");
    const notableNotes = input.checklistItems
      .map((item) => item.notes?.trim() ?? "")
      .filter((note) => Boolean(note))
      .slice(0, 4);

    const lines = [
      `${input.inspectionType} inspection for ${input.roomLabel} was completed by ${input.inspectorName}.`,
      `Checklist results: ${good.length} good, ${fair.length} fair, ${damaged.length} damaged, ${na.length} not-applicable.`,
    ];

    if (damaged.length > 0) {
      lines.push(
        `Priority follow-up areas: ${damaged
          .slice(0, 3)
          .map((item) => item.prompt || item.section || "reported issue")
          .join("; ")}.`,
      );
    } else if (fair.length > 0) {
      lines.push(
        `Areas to monitor: ${fair
          .slice(0, 3)
          .map((item) => item.prompt || item.section || "reported item")
          .join("; ")}.`,
      );
    } else {
      lines.push("No major deficiencies were recorded during this inspection.");
    }

    if (notableNotes.length > 0) {
      lines.push(`Inspector notes: ${notableNotes.join(" | ")}.`);
    }

    lines.push("This draft should be reviewed by an admin before tenant publication.");
    return { draft: lines.join(" "), usedFallback: false };
  }
}

export function getSummaryGenerator(): SummaryGenerator {
  // PRD-01 integration boundary:
  // swap with VertexSummaryGenerator in later PRDs without changing callers.
  return new HeuristicSummaryGenerator();
}
