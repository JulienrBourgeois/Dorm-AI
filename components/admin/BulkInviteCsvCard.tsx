"use client";

import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import {
  adminInputClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "@/components/admin/adminConsolePrimitives";

type BulkInviteCsvCardProps<T> = {
  title: string;
  summary: string;
  templateFilename: string;
  templateCsv: string;
  parseCsv: (text: string) => { rows: T[]; errors: string[] };
  previewHeaders: string[];
  previewRow: (row: T) => string[];
  onInviteAll: (rows: T[]) => Promise<{
    ok: number;
    failed: number;
    failures: string[];
  }>;
  disabled?: boolean;
};

export function BulkInviteCsvCard<T>({
  title,
  summary,
  templateFilename,
  templateCsv,
  parseCsv,
  previewHeaders,
  previewRow,
  onInviteAll,
  disabled = false,
}: BulkInviteCsvCardProps<T>) {
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [rows, setRows] = useState<T[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRunFailures, setLastRunFailures] = useState<string[]>([]);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([templateCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [templateCsv, templateFilename]);

  const onFile = useCallback(
    (file: File | null) => {
      setFileName(file?.name ?? null);
      setRows([]);
      setParseErrors([]);
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const { rows: next, errors } = parseCsv(text);
        setParseErrors(errors);
        setRows(next);
        if (next.length === 0 && errors.length === 0) {
          setParseErrors(["No data rows found after the header."]);
        }
      };
      reader.readAsText(file);
    },
    [parseCsv],
  );

  async function runBulk() {
    if (rows.length === 0) {
      toast.error("Choose a CSV file with at least one row.");
      return;
    }
    setRunning(true);
    setLastRunFailures([]);
    try {
      const { ok, failed, failures } = await onInviteAll(rows);
      setLastRunFailures(failures);
      if (failed === 0) {
        toast.success(`Created ${ok} invite${ok === 1 ? "" : "s"}.`);
      } else if (ok === 0) {
        toast.error(`None of the ${failed} row${failed === 1 ? "" : "s"} could be invited.`);
      } else {
        toast.warning(`Partial success: ${ok} created, ${failed} failed.`, {
          description: "See details under the preview.",
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk invite failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className={`${adminSecondaryBtnClass} shrink-0 text-xs`}
        >
          Download template
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor={inputId} className="sr-only">
          CSV file
        </label>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          disabled={disabled || running}
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          className={`${adminInputClass} max-w-md cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800 dark:file:bg-zinc-700 dark:file:text-zinc-100`}
        />
        <button
          type="button"
          onClick={() => void runBulk()}
          disabled={disabled || running || rows.length === 0}
          className={`${adminPrimaryBtnClass} shrink-0`}
        >
          {running ? "Sending invites…" : `Invite ${rows.length || "…"} from CSV`}
        </button>
      </div>

      {fileName ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Selected: {fileName}</p>
      ) : null}

      {parseErrors.length > 0 ? (
        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-amber-800 dark:text-amber-200">
          {parseErrors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-100 text-left dark:bg-zinc-800">
                {previewHeaders.map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((row, i) => (
                <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
                  {previewRow(row).map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 12 ? (
            <p className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Showing first 12 of {rows.length} rows.
            </p>
          ) : null}
        </div>
      ) : null}

      {lastRunFailures.length > 0 ? (
        <ul className="mt-3 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-sm text-red-700 dark:text-red-300">
          {lastRunFailures.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
