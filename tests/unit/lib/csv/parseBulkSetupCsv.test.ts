import { describe, expect, it } from "vitest";
import { parseBulkSetupCsv, parseCsvLine } from "@/lib/csv/parseBulkSetupCsv";

describe("parseCsvLine (bulk setup)", () => {
  it("splits on commas outside quotes", () => {
    expect(parseCsvLine('building,"A, B",addr')).toEqual(["building", "A, B", "addr"]);
  });

  it("handles doubled quotes in quoted cells", () => {
    expect(parseCsvLine('"a""b",c')).toEqual(['a"b', "c"]);
  });
});

describe("parseBulkSetupCsv", () => {
  it("parses mixed row types and normalizes case", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "building,Berkeley Hall,berk,123 Campus Drive,,,,37.8,-122.2",
      "tenant,Jane Doe,,,jane@example.com,101A,,,",
      "inspector,Alex Smith,,,alex@example.com,,berk,,",
    ].join("\n");

    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.issues).toEqual([]);
    expect(parsed.buildings).toEqual([
      {
        code: "BERK",
        name: "Berkeley Hall",
        address: "123 Campus Drive",
        latitude: 37.8,
        longitude: -122.2,
      },
    ]);
    expect(parsed.tenants).toEqual([
      { name: "Jane Doe", email: "jane@example.com", roomNumber: "101A" },
    ]);
    expect(parsed.inspectors).toEqual([
      { name: "Alex Smith", email: "alex@example.com", buildingCode: "BERK" },
    ]);
  });

  it("reports missing required header columns", () => {
    const parsed = parseBulkSetupCsv("name,email\nJane,jane@example.com\n");
    expect(parsed.buildings).toEqual([]);
    expect(parsed.tenants).toEqual([]);
    expect(parsed.inspectors).toEqual([]);
    expect(parsed.issues.some((issue) => issue.message.includes("type"))).toBe(true);
  });

  it("reports unknown type and invalid email", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "foo,Unknown,,,,,,,",
      "tenant,Jane Doe,,,not-an-email,101A,,,",
    ].join("\n");
    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.buildings).toEqual([]);
    expect(parsed.tenants).toEqual([]);
    expect(parsed.inspectors).toEqual([]);
    expect(parsed.issues.some((issue) => issue.message.includes("Unknown type"))).toBe(true);
    expect(parsed.issues.some((issue) => issue.message.includes("Invalid email"))).toBe(true);
  });

  it("rejects duplicate building codes in one file", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "building,One,A,,,,,,",
      "building,Two,A,,,,,,",
    ].join("\n");
    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.buildings).toHaveLength(1);
    expect(parsed.issues.some((issue) => issue.message.includes("Duplicate building code"))).toBe(
      true,
    );
  });

  it("rejects building rows when one coordinate is missing", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "building,One,A,,,,,37.1,",
    ].join("\n");
    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.buildings).toEqual([]);
    expect(parsed.issues.some((issue) => issue.message.includes("both \"latitude\" and \"longitude\""))).toBe(true);
  });

  it("rejects out-of-range building coordinates", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "building,One,A,,,,,91,-122",
    ].join("\n");
    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.buildings).toEqual([]);
    expect(parsed.issues.some((issue) => issue.message.includes("between -90 and 90"))).toBe(true);
  });

  it("keeps valid mixed rows while skipping invalid building coordinates", () => {
    const csv = [
      "type,name,code,address,email,room,building,latitude,longitude",
      "building,One,A,123 Main St,,,,37.1,-122.2",
      "building,Two,B,456 Main St,,,,37.2,",
      "tenant,Jane Doe,,,jane@example.com,101A,,,",
      "inspector,Alex Smith,,,alex@example.com,,A,,",
    ].join("\n");
    const parsed = parseBulkSetupCsv(csv);
    expect(parsed.buildings).toEqual([
      { code: "A", name: "One", address: "123 Main St", latitude: 37.1, longitude: -122.2 },
    ]);
    expect(parsed.tenants).toEqual([
      { name: "Jane Doe", email: "jane@example.com", roomNumber: "101A" },
    ]);
    expect(parsed.inspectors).toEqual([
      { name: "Alex Smith", email: "alex@example.com", buildingCode: "A" },
    ]);
    expect(parsed.issues).toHaveLength(1);
    expect(parsed.issues[0]?.line).toBe(3);
  });
});
