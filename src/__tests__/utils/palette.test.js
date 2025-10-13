// src/__tests__/utils/palette.test.js

import { basePalette } from '../../utils/palette';

describe('basePalette', () => {
  describe('structure and properties', () => {
    test('is an array', () => {
      expect(Array.isArray(basePalette)).toBe(true);
    });

    test('has exactly 10 colors', () => {
      expect(basePalette).toHaveLength(10);
    });

    test('all elements are strings', () => {
      basePalette.forEach(color => {
        expect(typeof color).toBe('string');
      });
    });

    test('all elements are hex color codes', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
      basePalette.forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    test('all colors are lowercase', () => {
      basePalette.forEach(color => {
        expect(color).toBe(color.toLowerCase());
      });
    });

    test('all colors start with #', () => {
      basePalette.forEach(color => {
        expect(color.startsWith('#')).toBe(true);
      });
    });
  });

  describe('color values', () => {
    test('contains expected color sequence', () => {
      const expectedColors = [
        "#f1f5f9", // light gray (no/low data)
        "#86efac",
        "#4ade80",
        "#22c55e",
        "#a3e635",
        "#facc15",
        "#f59e0b",
        "#fb923c",
        "#ef4444",
        "#b91c1c",
      ];

      expect(basePalette).toEqual(expectedColors);
    });

    test('first color is light gray', () => {
      expect(basePalette[0]).toBe("#f1f5f9");
    });

    test('last color is dark red', () => {
      expect(basePalette[9]).toBe("#b91c1c");
    });

    test('middle colors are green to yellow to orange', () => {
      // Verify the general progression
      expect(basePalette[1]).toBe("#86efac"); // light green
      expect(basePalette[5]).toBe("#facc15"); // yellow
      expect(basePalette[7]).toBe("#fb923c"); // orange
    });
  });

  describe('color uniqueness', () => {
    test('all colors are unique', () => {
      const uniqueColors = new Set(basePalette);
      expect(uniqueColors.size).toBe(basePalette.length);
    });

    test('no duplicate colors in palette', () => {
      const colorCounts = {};
      basePalette.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      Object.values(colorCounts).forEach(count => {
        expect(count).toBe(1);
      });
    });
  });

  describe('valid hex colors', () => {
    test('each color can be parsed as valid hex', () => {
      basePalette.forEach(color => {
        const hex = color.slice(1); // Remove #
        const num = parseInt(hex, 16);
        expect(Number.isNaN(num)).toBe(false);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(0xFFFFFF);
      });
    });

    test('hex values are properly formatted', () => {
      basePalette.forEach(color => {
        // Should be # followed by exactly 6 hex digits
        expect(color.length).toBe(7);
        expect(color[0]).toBe('#');

        const hexPart = color.slice(1);
        expect(/^[0-9a-f]{6}$/.test(hexPart)).toBe(true);
      });
    });
  });

  describe('immutability', () => {
    test('original palette is not modified when copied', () => {
      const original = [...basePalette];
      const copy = [...basePalette];
      copy.reverse();

      expect(basePalette).toEqual(original);
    });

    test('palette reference remains constant', () => {
      const ref1 = basePalette;
      const ref2 = basePalette;

      expect(ref1).toBe(ref2);
    });
  });

  describe('color progression for risk visualization', () => {
    test('progression goes from light to dark', () => {
      // Simple check: later colors should generally have lower hex values
      // This is a rough approximation for the gradient concept
      const firstColorValue = parseInt(basePalette[0].slice(1), 16);
      const lastColorValue = parseInt(basePalette[9].slice(1), 16);

      // First color (light gray) should be lighter than last (dark red)
      expect(firstColorValue).toBeGreaterThan(lastColorValue);
    });

    test('contains colors suitable for choropleth map', () => {
      // Verify we have a range suitable for visualization
      // Should have distinguishable colors
      expect(basePalette.length).toBeGreaterThanOrEqual(5);

      // Should have color variety (not all same hue)
      const uniqueFirstChars = new Set(
        basePalette.map(c => c.slice(1, 3))
      );
      expect(uniqueFirstChars.size).toBeGreaterThan(1);
    });
  });

  describe('usage compatibility', () => {
    test('can be reversed without error', () => {
      const reversed = [...basePalette].reverse();
      expect(reversed).toHaveLength(10);
      expect(reversed[0]).toBe(basePalette[9]);
      expect(reversed[9]).toBe(basePalette[0]);
    });

    test('can be sliced', () => {
      const subset = basePalette.slice(0, 5);
      expect(subset).toHaveLength(5);
      expect(subset[0]).toBe(basePalette[0]);
    });

    test('can be mapped', () => {
      const uppercase = basePalette.map(c => c.toUpperCase());
      expect(uppercase[0]).toBe("#F1F5F9");
    });

    test('can be used in filter', () => {
      const filtered = basePalette.filter(c => c.includes('e'));
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('specific color positions for risk levels', () => {
    test('position 0 is suitable for no/low data', () => {
      // Should be a neutral/light color
      expect(basePalette[0]).toBe("#f1f5f9");
    });

    test('positions 1-4 are green shades for low risk', () => {
      const greenColors = basePalette.slice(1, 5);
      greenColors.forEach(color => {
        // Green colors typically have high middle byte
        const green = parseInt(color.slice(3, 5), 16);
        expect(green).toBeGreaterThan(150);
      });
    });

    test('positions 5-7 are yellow/orange for medium risk', () => {
      const yellowOrange = basePalette.slice(5, 8);
      expect(yellowOrange).toContain("#facc15"); // yellow
      expect(yellowOrange).toContain("#f59e0b"); // orange
    });

    test('positions 8-9 are red for high risk', () => {
      const redColors = basePalette.slice(8, 10);
      redColors.forEach(color => {
        // Red colors have high first byte
        const red = parseInt(color.slice(1, 3), 16);
        expect(red).toBeGreaterThan(150);
      });
    });
  });
});
