import { describe, expect, it } from "vitest";
import {
  getObjectContainRect,
  mapPercentToPixelOffset,
  offsetToMapPercent,
} from "@/lib/map/propertyMapGeometry";

function fakeImg(opts: {
  nw: number;
  nh: number;
  cw: number;
  ch: number;
}): HTMLImageElement {
  return {
    naturalWidth: opts.nw,
    naturalHeight: opts.nh,
    clientWidth: opts.cw,
    clientHeight: opts.ch,
  } as HTMLImageElement;
}

describe("getObjectContainRect", () => {
  it("returns null when natural size missing", () => {
    expect(getObjectContainRect(fakeImg({ nw: 0, nh: 100, cw: 100, ch: 100 }))).toBeNull();
  });

  it("computes letterboxed rect", () => {
    const img = fakeImg({ nw: 200, nh: 100, cw: 100, ch: 100 });
    const box = getObjectContainRect(img);
    expect(box).not.toBeNull();
    expect(box!.drawW).toBe(100);
    expect(box!.drawH).toBe(50);
    expect(box!.offsetY).toBe(25);
  });
});

describe("offsetToMapPercent", () => {
  it("maps click inside drawable area to percent", () => {
    const img = fakeImg({ nw: 100, nh: 100, cw: 100, ch: 100 });
    const p = offsetToMapPercent(img, 50, 50);
    expect(p).toEqual({ x: 50, y: 50 });
  });

  it("returns null outside drawable area", () => {
    const img = fakeImg({ nw: 100, nh: 100, cw: 100, ch: 100 });
    expect(offsetToMapPercent(img, -1, 50)).toBeNull();
    expect(offsetToMapPercent(img, 150, 50)).toBeNull();
  });
});

describe("mapPercentToPixelOffset", () => {
  it("round-trips with center percent on square image", () => {
    const img = fakeImg({ nw: 100, nh: 100, cw: 100, ch: 100 });
    const px = mapPercentToPixelOffset(img, 50, 50);
    expect(px).toEqual({ left: 50, top: 50 });
  });
});
