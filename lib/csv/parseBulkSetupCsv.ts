export type BulkSetupRowType = "building" | "tenant" | "inspector";

export type BulkSetupBuildingRow = {
  code: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

export type BulkSetupTenantRow = {
  name: string;
  email: string;
  roomNumber?: string;
};

export type BulkSetupInspectorRow = {
  name: string;
  email: string;
  buildingCode?: string;
};

export type ParseBulkSetupCsvIssue = {
  line: number;
  message: string;
};

export type ParseBulkSetupCsvResult = {
  buildings: BulkSetupBuildingRow[];
  tenants: BulkSetupTenantRow[];
  inspectors: BulkSetupInspectorRow[];
  issues: ParseBulkSetupCsvIssue[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

function headerIndexMap(headerLine: string): Map<string, number> {
  const map = new Map<string, number>();
  const headers = parseCsvLine(headerLine).map((cell) =>
    normalizeHeader(cell.replace(/^\uFEFF/, "")),
  );
  headers.forEach((name, idx) => {
    if (!name) return;
    if (!map.has(name)) {
      map.set(name, idx);
    }
  });
  return map;
}

function cell(cells: string[], index: number | undefined): string {
  if (index == null || index < 0) return "";
  return (cells[index] ?? "").trim();
}

export function parseBulkSetupCsv(text: string): ParseBulkSetupCsvResult {
  const issues: ParseBulkSetupCsvIssue[] = [];
  const raw = stripBom(text);
  const lines = raw.split(/\r?\n/).map((line) => line.trimEnd());
  const nonEmpty: { lineNo: number; line: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const value = lines[i]!;
    if (!value.trim()) continue;
    nonEmpty.push({ lineNo: i + 1, line: value });
  }

  if (nonEmpty.length === 0) {
    return {
      buildings: [],
      tenants: [],
      inspectors: [],
      issues: [{ line: 1, message: "CSV is empty." }],
    };
  }

  const header = nonEmpty[0]!;
  const index = headerIndexMap(header.line);
  if (!index.has("type")) {
    return {
      buildings: [],
      tenants: [],
      inspectors: [],
      issues: [{ line: header.lineNo, message: 'Header must include "type".' }],
    };
  }
  if (!index.has("name")) {
    return {
      buildings: [],
      tenants: [],
      inspectors: [],
      issues: [{ line: header.lineNo, message: 'Header must include "name".' }],
    };
  }

  const typeIdx = index.get("type");
  const codeIdx = index.get("code");
  const nameIdx = index.get("name");
  const addressIdx = index.get("address");
  const emailIdx = index.get("email");
  const roomIdx = index.get("room");
  const buildingIdx = index.get("building");
  const latitudeIdx = index.get("latitude");
  const longitudeIdx = index.get("longitude");

  const buildings: BulkSetupBuildingRow[] = [];
  const tenants: BulkSetupTenantRow[] = [];
  const inspectors: BulkSetupInspectorRow[] = [];
  const seenBuildingCodes = new Set<string>();

  for (let i = 1; i < nonEmpty.length; i++) {
    const row = nonEmpty[i]!;
    const cells = parseCsvLine(row.line);
    const typeRaw = cell(cells, typeIdx).toLowerCase();
    const name = cell(cells, nameIdx);

    if (!typeRaw && !name) continue;
    if (!typeRaw) {
      issues.push({ line: row.lineNo, message: 'Missing type. Use "building", "tenant", or "inspector".' });
      continue;
    }

    if (typeRaw !== "building" && typeRaw !== "tenant" && typeRaw !== "inspector") {
      issues.push({ line: row.lineNo, message: `Unknown type "${typeRaw}".` });
      continue;
    }

    if (!name) {
      issues.push({ line: row.lineNo, message: "Missing name; row skipped." });
      continue;
    }

    if (typeRaw === "building") {
      const code = cell(cells, codeIdx).toUpperCase();
      const address = cell(cells, addressIdx);
      const latitudeRaw = cell(cells, latitudeIdx);
      const longitudeRaw = cell(cells, longitudeIdx);
      if (!code) {
        issues.push({ line: row.lineNo, message: 'Building rows require "code".' });
        continue;
      }
      if (seenBuildingCodes.has(code)) {
        issues.push({ line: row.lineNo, message: `Duplicate building code "${code}" in file; row skipped.` });
        continue;
      }
      let latitude: number | undefined;
      let longitude: number | undefined;
      const hasLatitude = latitudeRaw.length > 0;
      const hasLongitude = longitudeRaw.length > 0;
      if (hasLatitude !== hasLongitude) {
        issues.push({
          line: row.lineNo,
          message: 'Building rows require both "latitude" and "longitude" together.',
        });
        continue;
      }
      if (hasLatitude && hasLongitude) {
        const lat = Number(latitudeRaw);
        const lng = Number(longitudeRaw);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          issues.push({
            line: row.lineNo,
            message: 'Building latitude/longitude must be valid numbers.',
          });
          continue;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          issues.push({
            line: row.lineNo,
            message:
              "Building latitude must be between -90 and 90; longitude must be between -180 and 180.",
          });
          continue;
        }
        latitude = lat;
        longitude = lng;
      }
      seenBuildingCodes.add(code);
      buildings.push({
        code,
        name,
        address,
        ...(latitude != null && longitude != null ? { latitude, longitude } : {}),
      });
      continue;
    }

    const email = cell(cells, emailIdx).toLowerCase();
    if (!email) {
      issues.push({ line: row.lineNo, message: `${typeRaw} rows require "email".` });
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      issues.push({ line: row.lineNo, message: `Invalid email "${email}".` });
      continue;
    }

    if (typeRaw === "tenant") {
      const roomNumber = cell(cells, roomIdx);
      tenants.push({
        name,
        email,
        ...(roomNumber ? { roomNumber } : {}),
      });
      continue;
    }

    const buildingCode = cell(cells, buildingIdx).toUpperCase();
    inspectors.push({
      name,
      email,
      ...(buildingCode ? { buildingCode } : {}),
    });
  }

  return { buildings, tenants, inspectors, issues };
}
