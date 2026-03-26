import { getSummaryGenerator } from "@/app/lib/ai/summaryService";
import { getAdminAuth, getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore";
import { requireSessionCookie } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireEnum, requireString } from "@/lib/core/validation";

type SummaryRequestBody = {
  action?: "generate" | "review" | "finalize";
  draft?: string;
  finalSummary?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ inspectionId: string }> },
) {
  try {
    const { inspectionId } = await params;
    const body = (await request.json()) as SummaryRequestBody;
    const action = requireEnum(body.action, ["generate", "review", "finalize"], "action");

    const sessionCookie = requireSessionCookie(request);
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminFirestore();
    const inspectionRef = db.collection(COLLECTIONS.inspections).doc(inspectionId);
    const inspectionSnap = await inspectionRef.get();
    if (!inspectionSnap.exists) {
      throw new AppError("NOT_FOUND", "Inspection not found", 404);
    }
    const inspection = inspectionSnap.data() as {
      roomLabel?: string;
      type?: string;
      inspectorId?: string;
      organizationId?: string;
      aiSummaryDraft?: string;
    };

    if (action === "generate") {
      const checklistSnap = await db
        .collection(COLLECTIONS.inspectionItems)
        .where("inspectionId", "==", inspectionId)
        .get();
      const inspectorSnap = inspection.inspectorId
        ? await db.collection(COLLECTIONS.users).doc(inspection.inspectorId).get()
        : null;
      const inspectorName =
        (inspectorSnap?.data() as { name?: string } | undefined)?.name ||
        "assigned inspector";
      const checklistItems = checklistSnap.docs.map((doc) => {
        const item = doc.data() as {
          section?: string;
          prompt?: string;
          response?: string;
          notes?: string;
        };
        return {
          section: item.section || "",
          prompt: item.prompt || "",
          response:
            (item.response as "GOOD" | "FAIR" | "DAMAGED" | "NA" | undefined) ||
            "NA",
          notes: item.notes || "",
        };
      });

      const generator = getSummaryGenerator();
      const summaryResult = await generator.generate({
        inspectionId,
        roomLabel: inspection.roomLabel || "this room",
        inspectionType: inspection.type || "Inspection",
        inspectorName,
        checklistItems,
      });

      await inspectionRef.update({
        aiSummaryDraft: summaryResult.draft,
        aiSummaryStatus: "UNDER_REVIEW",
        aiSummaryError: summaryResult.diagnostics || null,
        aiSummaryGeneratedAt: new Date(),
        aiSummaryGeneratedBy: decoded.uid,
        updatedAt: new Date(),
      });

      return apiOk({
        status: "UNDER_REVIEW",
        draft: summaryResult.draft,
        fallback: summaryResult.usedFallback,
      });
    }

    if (action === "review") {
      const reviewedDraft = requireString(body.draft, "draft", { minLength: 1, maxLength: 5000 });
      await inspectionRef.update({
        aiSummaryDraft: reviewedDraft,
        aiSummaryStatus: "UNDER_REVIEW",
        aiSummaryError: null,
        updatedAt: new Date(),
      });
      return apiOk({ status: "UNDER_REVIEW", draft: reviewedDraft });
    }

    if (action === "finalize") {
      const finalSummary = (body.finalSummary || inspection.aiSummaryDraft || "").trim();
      if (!finalSummary) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Generate or review a summary draft first.",
          400,
        );
      }
      await inspectionRef.update({
        aiSummary: finalSummary,
        aiSummaryDraft: finalSummary,
        aiSummaryStatus: "FINALIZED",
        aiSummaryError: null,
        aiSummaryFinalizedAt: new Date(),
        aiSummaryFinalizedBy: decoded.uid,
        updatedAt: new Date(),
      });
      return apiOk({ status: "FINALIZED", summary: finalSummary });
    }

    throw new AppError("VALIDATION_ERROR", "Unsupported action", 400);
  } catch (err) {
    console.error("[inspections/summary]", err);
    return apiError(err, "Failed summary action");
  }
}
