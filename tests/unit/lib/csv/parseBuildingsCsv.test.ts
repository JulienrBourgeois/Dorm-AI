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
    const csv = `name,code,address,latitude,longitude
West Hall,WH,123 St,37.8,-122.2
East,EH,,,
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(issues).toHaveLength(0);
    expect(rows).toEqual([
      { code: "WH", name: "West Hall", address: "123 St", latitude: 37.8, longitude: -122.2 },
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

  it("skips row when only one coordinate is provided", () => {
    const csv = `code,name,latitude,longitude
A,One,37.1,
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(rows).toEqual([]);
    expect(issues.some((i) => i.message.includes("both be provided together"))).toBe(true);
  });

  it("skips row when coordinate is out of range", () => {
    const csv = `code,name,latitude,longitude
A,One,101,-122
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(rows).toEqual([]);
    expect(issues.some((i) => i.message.includes("between -90 and 90"))).toBe(true);
  });

  it("keeps valid rows when mixed with invalid coordinate rows", () => {
    const csv = `code,name,address,latitude,longitude
A,One,123 St,37.1,-122.2
B,Two,456 St,,
C,Three,789 St,95,-120
D,Four,234 St,38.4,
`;
    const { rows, issues } = parseBuildingsCsv(csv);
    expect(rows).toEqual([
      { code: "A", name: "One", address: "123 St", latitude: 37.1, longitude: -122.2 },
      { code: "B", name: "Two", address: "456 St" },
    ]);
    expect(issues).toHaveLength(2);
    expect(issues.some((issue) => issue.line === 4)).toBe(true);
    expect(issues.some((issue) => issue.line === 5)).toBe(true);
  });
});
