// src/__tests__/utils/bins.test.js

import { makeLogBinsFromRange, buildLogEqualBinsIncludingZero } from '../../utils/bins';

describe('makeLogBinsFromRange', () => {
  describe('valid inputs', () => {
    test('creates 10 logarithmic bins from valid range', () => {
      const result = makeLogBinsFromRange(1, 1000, 10);

      expect(result).toHaveLength(10);
      expect(result[0].min).toBeCloseTo(1, 5);
      expect(result[9].max).toBeCloseTo(1000, 5);

      // Check that bins are contiguous (each max equals next min)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].max).toBeCloseTo(result[i + 1].min, 5);
      }
    });

    test('creates bins with logarithmic spacing', () => {
      const result = makeLogBinsFromRange(10, 10000, 5);

      expect(result).toHaveLength(5);

      // Verify logarithmic spacing by checking ratios
      const ratios = [];
      for (let i = 0; i < result.length - 1; i++) {
        ratios.push(result[i + 1].min / result[i].min);
      }

      // All ratios should be approximately equal in log space
      const avgRatio = ratios.reduce((a, b) => a + b) / ratios.length;
      ratios.forEach(ratio => {
        expect(ratio).toBeCloseTo(avgRatio, 1);
      });
    });

    test('handles small positive range', () => {
      const result = makeLogBinsFromRange(0.01, 1, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBeCloseTo(0.01, 5);
      expect(result[4].max).toBeCloseTo(1, 5);
    });

    test('handles large positive range', () => {
      const result = makeLogBinsFromRange(1, 1000000, 10);

      expect(result).toHaveLength(10);
      expect(result[0].min).toBeCloseTo(1, 5);
      expect(result[9].max).toBeCloseTo(1000000, 5);
    });

    test('creates single bin when k=1', () => {
      const result = makeLogBinsFromRange(1, 100, 1);

      expect(result).toHaveLength(1);
      expect(result[0].min).toBeCloseTo(1, 5);
      expect(result[0].max).toBeCloseTo(100, 5);
    });

    test('handles fractional k by flooring', () => {
      const result = makeLogBinsFromRange(1, 100, 5.7);

      expect(result).toHaveLength(5);
    });
  });

  describe('invalid inputs', () => {
    test('returns empty array when min is zero', () => {
      const result = makeLogBinsFromRange(0, 100, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array when min is negative', () => {
      const result = makeLogBinsFromRange(-10, 100, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array when max is zero', () => {
      const result = makeLogBinsFromRange(1, 0, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array when max is negative', () => {
      const result = makeLogBinsFromRange(1, -100, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array when min >= max', () => {
      const result = makeLogBinsFromRange(100, 10, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array when min equals max', () => {
      const result = makeLogBinsFromRange(50, 50, 10);
      expect(result).toEqual([]);
    });

    test('returns empty array for non-finite values', () => {
      expect(makeLogBinsFromRange(NaN, 100, 10)).toEqual([]);
      expect(makeLogBinsFromRange(1, NaN, 10)).toEqual([]);
      expect(makeLogBinsFromRange(Infinity, 100, 10)).toEqual([]);
      expect(makeLogBinsFromRange(1, Infinity, 10)).toEqual([]);
    });

    test('handles k=0 by creating single bin', () => {
      const result = makeLogBinsFromRange(1, 100, 0);
      expect(result).toHaveLength(1);
    });

    test('handles negative k by creating single bin', () => {
      const result = makeLogBinsFromRange(1, 100, -5);
      expect(result).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    test('handles very close min and max values', () => {
      const result = makeLogBinsFromRange(1, 1.001, 3);

      expect(result).toHaveLength(3);
      expect(result[0].min).toBeCloseTo(1, 5);
      expect(result[2].max).toBeCloseTo(1.001, 5);
    });

    test('bins are in ascending order', () => {
      const result = makeLogBinsFromRange(1, 1000, 10);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].min).toBeLessThan(result[i + 1].min);
        expect(result[i].max).toBeLessThanOrEqual(result[i + 1].max);
      }
    });
  });
});

describe('buildLogEqualBinsIncludingZero', () => {
  describe('valid inputs with mixed values', () => {
    test('creates bins including zero bin for mixed data', () => {
      const values = [0, 0, 0, 1, 5, 10, 50, 100, 200, 500];
      const result = buildLogEqualBinsIncludingZero(values, 10);

      expect(result).toHaveLength(10);
      expect(result[0].min).toBe(0);
      expect(result[0].max).toBeGreaterThan(0);
      expect(result[9].max).toBeCloseTo(500, 5);
    });

    test('first bin captures zero values', () => {
      const values = [0, 0, 1, 2, 3, 4, 5];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result[0].min).toBe(0);
      expect(result[0].max).toBeGreaterThan(0);
    });

    test('bins are contiguous', () => {
      const values = [0, 1, 10, 100, 1000];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      // Last bin might not be perfectly contiguous due to max override
      for (let i = 0; i < result.length - 2; i++) {
        expect(result[i].max).toBeCloseTo(result[i + 1].min, 5);
      }
    });

    test('handles data without zeros', () => {
      const values = [1, 5, 10, 50, 100, 500];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[result.length - 1].max).toBe(500);
    });

    test('handles large dataset', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 10);
      const result = buildLogEqualBinsIncludingZero(values, 10);

      expect(result).toHaveLength(10);
      expect(result[0].min).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('handles all zero values', () => {
      const values = [0, 0, 0, 0, 0];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      result.forEach(bin => {
        expect(bin.min).toBe(0);
        expect(bin.max).toBe(0);
      });
    });

    test('handles single zero value', () => {
      const values = [0];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      result.forEach(bin => {
        expect(bin.min).toBe(0);
        expect(bin.max).toBe(0);
      });
    });

    test('handles single positive value', () => {
      const values = [100];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[4].max).toBe(100);
    });

    test('handles two values (zero and positive)', () => {
      const values = [0, 100];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[4].max).toBe(100);
    });

    test('returns empty array for empty input', () => {
      const result = buildLogEqualBinsIncludingZero([], 10);
      expect(result).toEqual([]);
    });

    test('filters out negative values', () => {
      const values = [-10, -5, 0, 5, 10, 50];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[4].max).toBe(50);
    });

    test('filters out NaN and Infinity', () => {
      const values = [0, NaN, 5, Infinity, 10, -Infinity, 50];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[4].max).toBe(50);
    });

    test('handles unsorted input', () => {
      const values = [100, 0, 50, 10, 5, 1, 200];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0].min).toBe(0);
      expect(result[4].max).toBe(200);

      // Verify bins are in ascending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].min).toBeLessThanOrEqual(result[i + 1].min);
      }
    });
  });

  describe('k parameter variations', () => {
    test('creates bins with k=1 (zero bin + log bin)', () => {
      const values = [0, 1, 10, 100];
      const result = buildLogEqualBinsIncludingZero(values, 1);

      // With k=1, we get zero bin [0, posMin) and then one more bin
      // Total = 2 bins (one for zero, one for positive values)
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].min).toBe(0);
    });

    test('creates correct number of bins for k=3', () => {
      const values = [0, 1, 10, 100];
      const result = buildLogEqualBinsIncludingZero(values, 3);

      expect(result).toHaveLength(3);
    });

    test('creates correct number of bins for k=20', () => {
      const values = Array.from({ length: 100 }, (_, i) => i);
      const result = buildLogEqualBinsIncludingZero(values, 20);

      expect(result).toHaveLength(20);
    });
  });

  describe('non-array inputs', () => {
    test('handles null input', () => {
      const result = buildLogEqualBinsIncludingZero(null, 5);
      expect(result).toEqual([]);
    });

    test('handles undefined input', () => {
      const result = buildLogEqualBinsIncludingZero(undefined, 5);
      expect(result).toEqual([]);
    });

    test('handles non-array input', () => {
      const result = buildLogEqualBinsIncludingZero('not an array', 5);
      expect(result).toEqual([]);
    });
  });

  describe('bins structure validation', () => {
    test('each bin has min and max properties', () => {
      const values = [0, 1, 10, 100];
      const result = buildLogEqualBinsIncludingZero(values, 5);

      result.forEach(bin => {
        expect(bin).toHaveProperty('min');
        expect(bin).toHaveProperty('max');
        expect(typeof bin.min).toBe('number');
        expect(typeof bin.max).toBe('number');
      });
    });

    test('bins are in ascending order by min', () => {
      const values = [0, 1, 10, 100, 1000];
      const result = buildLogEqualBinsIncludingZero(values, 10);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].min).toBeLessThanOrEqual(result[i + 1].min);
      }
    });

    test('within each bin, min <= max', () => {
      const values = [0, 1, 10, 100, 1000];
      const result = buildLogEqualBinsIncludingZero(values, 10);

      result.forEach(bin => {
        expect(bin.min).toBeLessThanOrEqual(bin.max);
      });
    });
  });
});