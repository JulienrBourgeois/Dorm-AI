# PRD-10: AI Summary Generation with Human Review

## Goal
Generate concise inspection summaries using Vertex AI while keeping final authority with human reviewers.

## Source alignment
- Master PRD sections: 1.4, 9.1, 11.6, 13.1, 13.3.
- Functional requirements: FR-26 through FR-28.

## Scope
- Trigger AI summary generation on inspection submission.
- Prompt template based on structured checklist + notes + evidence metadata.
- Confidence and safety guardrails.
- Human review/approval before tenant-visible finalization.

## Constraints
- AI output is assistive, never legal/source-of-truth.
- Unsafe or low-quality outputs require retry or manual rewrite.

## Acceptance criteria
- System generates a draft summary for submitted inspections.
- Reviewer can edit/approve/reject generated summary.
- Final report stores revision history of AI and human edits.
- Fallback behavior exists when AI service is unavailable.
