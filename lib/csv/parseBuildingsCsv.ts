/**
 * Parse building rows from CSV text. First row must be a header with columns
 * code, name, and optionally address/latitude/longitude (order flexible, case-insensitive).
 */

export type ParsedBuildingRow = {
  code: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

export type ParseBuildingsCsvIssue = {
  line: number;
  message: string;
};

export type ParseBuildingsCsvResult = {
  rows: ParsedBuildingRow[];
  issues: ParseBuildingsCsvIssue[];
};

/** Split a single CSV line into fields; supports quoted fields and doubled quotes. */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cur += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  out.push(cur.trim());
  return out;
}

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

export function parseBuildingsCsv(text: string): ParseBuildingsCsvResult {
  const issues: ParseBuildingsCsvIssue[] = [];
  const raw = stripBom(text);
  const lines = raw.split(/\r?\n/).map((l) => l.trimEnd());
  const nonEmptyLines: { lineNo: number; content: string }[] = [];
  let lineNo = 0;
  for (const line of lines) {
    lineNo++;
    if (line.trim() === "") continue;
    nonEmptyLines.push({ lineNo, content: line });
  }

  if (nonEmptyLines.length === 0) {
    issues.push({ line: 1, message: "CSV is empty." });
    return { rows: [], issues };
  }

  const headerCells = parseCsvLine(nonEmptyLines[0]!.content).map((h) =>
    h.replace(/^\uFEFF/, "").toLowerCase().trim()
  );
  const codeIdx = headerCells.indexOf("code");
  const nameIdx = headerCells.indexOf("name");
  const addressIdx = headerCells.indexOf("address");
  const latitudeIdx = headerCells.indexOf("latitude");
  const longitudeIdx = headerCells.indexOf("longitude");

  if (codeIdx < 0 || nameIdx < 0) {
    issues.push({
      line: nonEmptyLines[0]!.lineNo,
      message: 'First row must be a header with "code" and "name" columns. Optional: "address", "latitude", "longitude".',
    });
    return { rows: [], issues };
  }

  const rows: ParsedBuildingRow[] = [];
  const seenCodes = new Set<string>();

  for (let i = 1; i < nonEmptyLines.length; i++) {
    const { lineNo: ln, content } = nonEmptyLines[i]!;
    const cells = parseCsvLine(content);
    const code = (cells[codeIdx] ?? "").trim().toUpperCase();
    const name = (cells[nameIdx] ?? "").trim();
    const address = addressIdx >= 0 ? (cells[addressIdx] ?? "").trim() : "";
    const latitudeRaw = latitudeIdx >= 0 ? (cells[latitudeIdx] ?? "").trim() : "";
    const longitudeRaw = longitudeIdx >= 0 ? (cells[longitudeIdx] ?? "").trim() : "";

    if (!code && !name) continue;

    if (!code || !name) {
      issues.push({ line: ln, message: "Missing code or name; row skipped." });
      continue;
    }

    if (seenCodes.has(code)) {
      issues.push({ line: ln, message: `Duplicate code "${code}" in file; row skipped.` });
      continue;
    }
    let latitude: number | undefined;
    let longitude: number | undefined;
    const hasLatitude = latitudeRaw.length > 0;
    const hasLongitude = longitudeRaw.length > 0;
    if (hasLatitude !== hasLongitude) {
      issues.push({
        line: ln,
        message: 'Latitude and longitude must both be provided together; row skipped.',
      });
      continue;
    }
    if (hasLatitude && hasLongitude) {
      const lat = Number(latitudeRaw);
      const lng = Number(longitudeRaw);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        issues.push({
          line: ln,
          message: 'Latitude/longitude must be valid numbers; row skipped.',
        });
        continue;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        issues.push({
          line: ln,
          message: 'Latitude must be between -90 and 90; longitude must be between -180 and 180; row skipped.',
        });
        continue;
      }
      latitude = lat;
      longitude = lng;
    }

    seenCodes.add(code);
    rows.push({
      code,
      name,
      address,
      ...(latitude != null && longitude != null ? { latitude, longitude } : {}),
    });
  }

  return { rows, issues };
}
