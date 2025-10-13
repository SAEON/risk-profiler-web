// src/utils/bins.js

/**
 * Create K logarithmically spaced bins between gmin>0 and gmax.
 * Returns an array of { min, max } with ascending mins.
 */
export function makeLogBinsFromRange(gmin, gmax, k = 10) {
  const min = Number(gmin);
  const max = Number(gmax);
  const count = Math.max(1, Math.floor(k));

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min <= 0 ||
    max <= 0 ||
    min >= max
  ) {
    return [];
  }

  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const step = (logMax - logMin) / count;

  // K bins → K mins
  const mins = Array.from({ length: count }, (_, i) =>
    Math.exp(logMin + i * step)
  );

  // Convert mins → {min,max}; last bin max = gmax
  return mins.map((m, i) => ({
    min: m,
    max: i < mins.length - 1 ? mins[i + 1] : max,
  }));
}

/**
 * Build K bins over the provided non-negative values, including a zero bin.
 * Values are expected to be >= 0 (we'll coerce/filter defensively).
 * Returns { min, max }[] with ascending mins.
 */
export function buildLogEqualBinsIncludingZero(values, k = 10) {
  const arr = (Array.isArray(values) ? values : [])
    .map(Number)
    .filter((v) => Number.isFinite(v) && v >= 0)
    .sort((a, b) => a - b);

  if (!arr.length) return [];

  const max = arr[arr.length - 1];
  if (max === 0) {
    // All zeros → return equal linear placeholders 0..0
    return Array.from({ length: Math.max(1, k) }, () => ({ min: 0, max: 0 }));
  }

  const posMin = arr.find((v) => v > 0) ?? max;

  // If there are no positive values beyond zero, fall back to linear
  if (posMin === max) {
    const n = Math.max(1, k);
    const step = max / n;
    return Array.from({ length: n }, (_, i) => ({
      min: i * step,
      max: i < n - 1 ? (i + 1) * step : max,
    }));
  }

  // Reserve the first bin for [0, posMin)
  const logBins = makeLogBinsFromRange(posMin, max, Math.max(1, k - 1));

  // Prepend the zero bin and ensure continuity
  return [
    { min: 0, max: logBins[0]?.min ?? posMin },
    ...logBins.map((b, i) => ({
      min: b.min,
      max: i < logBins.length - 1 ? logBins[i + 1].min : max,
    })),
  ];
}
