/**
 * Helpers for placing pins on an <img> that uses object-contain (letterboxing).
 */

export type ObjectContainRect = {
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
};

export function getObjectContainRect(img: HTMLImageElement): ObjectContainRect | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;
  const rw = img.clientWidth;
  const rh = img.clientHeight;
  if (!rw || !rh) return null;
  const scale = Math.min(rw / nw, rh / nh);
  const dw = nw * scale;
  const dh = nh * scale;
  return {
    offsetX: (rw - dw) / 2,
    offsetY: (rh - dh) / 2,
    drawW: dw,
    drawH: dh,
  };
}

/** Offset from the image element's top-left (e.g. clientX/Y minus getBoundingClientRect). */
export function offsetToMapPercent(
  img: HTMLImageElement,
  offsetX: number,
  offsetY: number
): { x: number; y: number } | null {
  const box = getObjectContainRect(img);
  if (!box || box.drawW <= 0 || box.drawH <= 0) return null;
  const x = offsetX - box.offsetX;
  const y = offsetY - box.offsetY;
  if (x < 0 || y < 0 || x > box.drawW || y > box.drawH) return null;
  return { x: (x / box.drawW) * 100, y: (y / box.drawH) * 100 };
}

export function mapPercentToPixelOffset(
  img: HTMLImageElement,
  mapPinX: number,
  mapPinY: number
): { left: number; top: number } | null {
  const box = getObjectContainRect(img);
  if (!box) return null;
  return {
    left: box.offsetX + (mapPinX / 100) * box.drawW,
    top: box.offsetY + (mapPinY / 100) * box.drawH,
  };
}
