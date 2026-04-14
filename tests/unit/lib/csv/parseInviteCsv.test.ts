import { describe, expect, it } from "vitest";
import {
  normalizeCsvText,
  parseCsvLine,
  parseInspectorInviteCsv,
  parseTenantInviteCsv,
  splitCsvRows,
} from "@/lib/csv/parseInviteCsv";

describe("normalizeCsvText", () => {
  it("strips BOM and normalizes CRLF", () => {
    expect(normalizeCsvText("\uFEFFa\r\nb")).toBe("a\nb");
  });
});

describe("parseCsvLine (invite)", () => {
  it("toggles quotes and splits on commas outside quotes", () => {
    expect(parseCsvLine('one,"two,three",four')).toEqual([
      "one",
      "two,three",
      "four",
    ]);
  });
});

describe("splitCsvRows", () => {
  it("drops empty lines", () => {
    expect(splitCsvRows("a\n\nb")).toEqual(["a", "b"]);
  });
});

describe("parseTenantInviteCsv", () => {
  it("parses valid rows", () => {
    const { rows, errors } = parseTenantInviteCsv(
      "name,email,room\nJane,j@e.com,101\n",
    );
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ name: "Jane", email: "j@e.com", roomNumber: "101" }]);
  });

  it("errors when too few lines", () => {
    const { rows, errors } = parseTenantInviteCsv("name,email\n");
    expect(rows).toEqual([]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("errors on missing columns", () => {
    const { rows, errors } = parseTenantInviteCsv("a,b\nc,d\n");
    expect(rows).toEqual([]);
    expect(errors.some((e) => e.includes("name"))).toBe(true);
  });

  it("errors on invalid email", () => {
    const { rows, errors } = parseTenantInviteCsv(
      "name,email\nJane,not-an-email\n",
    );
    expect(rows).toEqual([]);
    expect(errors.some((e) => e.includes("invalid email"))).toBe(true);
  });
});

describe("parseInspectorInviteCsv", () => {
  it("uppercases building code when present", () => {
    const { rows, errors } = parseInspectorInviteCsv(
      "name,email,building\nBob,b@e.com,ab\n",
    );
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { name: "Bob", email: "b@e.com", buildingCode: "AB" },
    ]);
  });
});
