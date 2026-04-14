import { describe, expect, it } from "vitest";
import {
  parseBuildingsCsv,
  parseCsvLine,
} from "@/lib/csv/parseBuildingsCsv";

describe("parseCsvLine (buildings)", () => {
  it("splits simple fields", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("handles quoted commas", () => {
    expect(parseCsvLine('"a,b",c')).toEqual(["a,b", "c"]);
  });

  it("handles doubled quotes inside quotes", () => {
    expect(parseCsvLine('"a""b",c')).toEqual(['a"b', "c"]);
  });
});

describe("parseBuildingsCsv", () => {
  it("parses valid header and rows", () => {
    const csv = `name,code,address
West Hall,WH,123 St
East,EH,
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(issues).toHaveLength(0);
    expect(rows).toEqual([
      { code: "WH", name: "West Hall", address: "123 St" },
      { code: "EH", name: "East", address: "" },
    ]);
  });

  it("reports empty CSV", () => {
    const { rows, issues } = parseBuildingsCsv("   \n  ");
    expect(rows).toEqual([]);
    expect(issues.some((i) => i.message.includes("empty"))).toBe(true);
  });

  it("requires code and name in header", () => {
    const { rows, issues } = parseBuildingsCsv("foo,bar\na,b");
    expect(rows).toEqual([]);
    expect(
      issues.some((i) => i.message.includes("code") && i.message.includes("name")),
    ).toBe(true);
  });

  it("flags duplicate codes", () => {
    const csv = `code,name
A,One
A,Two
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(rows).toHaveLength(1);
    expect(issues.some((i) => i.message.includes("Duplicate"))).toBe(true);
  });

  it("strips BOM from header cell", () => {
    const csv = "\uFEFFcode,name\nX,Name1\n";
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(issues).toHaveLength(0);
    expect(rows).toEqual([{ code: "X", name: "Name1", address: "" }]);
  });
});
