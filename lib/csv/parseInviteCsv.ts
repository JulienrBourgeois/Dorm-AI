/** Strip UTF-8 BOM and normalize newlines. */
export function normalizeCsvText(raw: string): string {
  return raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** Minimal CSV line parser (commas; supports quoted fields). */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function splitCsvRows(text: string): string[] {
  return normalizeCsvText(text)
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
}

export type TenantCsvRow = {
  name: string;
  email: string;
  roomNumber?: string;
};

export type InspectorCsvRow = {
  name: string;
  email: string;
  buildingCode?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Tenants CSV: columns `name`, `email`, optional `room` (room number as shown in admin).
 */
export function parseTenantInviteCsv(text: string): {
  rows: TenantCsvRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const lines = splitCsvRows(text);
  if (lines.length < 2) {
    errors.push("Add a header row and at least one data row, or use the template.");
    return { rows: [], errors };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const idxName = headers.indexOf("name");
  const idxEmail = headers.indexOf("email");
  const idxRoom = headers.indexOf("room");
  if (idxName < 0 || idxEmail < 0) {
    errors.push('CSV must include columns "name" and "email". Optional: "room" (room number).');
    return { rows: [], errors };
  }

  const rows: TenantCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const name = (cells[idxName] ?? "").trim();
    const email = (cells[idxEmail] ?? "").trim().toLowerCase();
    const roomNumber =
      idxRoom >= 0 ? (cells[idxRoom] ?? "").trim() : undefined;
    const lineNo = i + 1;

    if (!name && !email) continue;
    if (!name || !email) {
      errors.push(`Row ${lineNo}: name and email are both required.`);
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      errors.push(`Row ${lineNo}: invalid email "${email}".`);
      continue;
    }
    rows.push({
      name,
      email,
      ...(roomNumber ? { roomNumber } : {}),
    });
  }

  return { rows, errors };
}

/**
 * Inspectors CSV: columns `name`, `email`, optional `building` (building code).
 */
export function parseInspectorInviteCsv(text: string): {
  rows: InspectorCsvRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const lines = splitCsvRows(text);
  if (lines.length < 2) {
    errors.push("Add a header row and at least one data row, or use the template.");
    return { rows: [], errors };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const idxName = headers.indexOf("name");
  const idxEmail = headers.indexOf("email");
  const idxBuilding = headers.indexOf("building");
  if (idxName < 0 || idxEmail < 0) {
    errors.push(
      'CSV must include columns "name" and "email". Optional: "building" (building code).',
    );
    return { rows: [], errors };
  }

  const rows: InspectorCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const name = (cells[idxName] ?? "").trim();
    const email = (cells[idxEmail] ?? "").trim().toLowerCase();
    const buildingCode =
      idxBuilding >= 0 ? (cells[idxBuilding] ?? "").trim() : undefined;
    const lineNo = i + 1;

    if (!name && !email) continue;
    if (!name || !email) {
      errors.push(`Row ${lineNo}: name and email are both required.`);
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      errors.push(`Row ${lineNo}: invalid email "${email}".`);
      continue;
    }
    rows.push({
      name,
      email,
      ...(buildingCode ? { buildingCode: buildingCode.toUpperCase() } : {}),
    });
  }

  return { rows, errors };
}
