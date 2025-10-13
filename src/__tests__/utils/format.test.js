// src/__tests__/utils/format.test.js

import { fmtNum, esc } from '../../utils/format';

describe('fmtNum', () => {
  describe('large numbers (>= 1000)', () => {
    test('formats integers >= 1000 with locale string', () => {
      const result = fmtNum(1000);
      // Locale-dependent, but should include separator
      expect(result).toMatch(/1[,\s.]000/);
    });

    test('formats large integer correctly', () => {
      const result = fmtNum(1234567);
      expect(result).toMatch(/1[,\s.]234[,\s.]567/);
    });

    test('formats floats >= 1000 with max 1 decimal', () => {
      const result = fmtNum(1234.567);
      // Should round to 1 decimal place
      expect(result).toMatch(/1[,\s.]234[.,]6/);
    });

    test('formats float 1000.1 with 1 decimal', () => {
      const result = fmtNum(1000.1);
      expect(result).toMatch(/1[,\s.]000[.,]1/);
    });

    test('formats negative large numbers', () => {
      const result = fmtNum(-5000);
      expect(result).toMatch(/-5[,\s.]000/);
    });

    test('formats negative large floats', () => {
      const result = fmtNum(-1234.56);
      expect(result).toMatch(/-1[,\s.]234[.,]6/);
    });
  });

  describe('medium numbers (>= 100 and < 1000)', () => {
    test('formats 100 with 1 decimal place', () => {
      const result = fmtNum(100);
      expect(result).toBe('100.0');
    });

    test('formats 500 with 1 decimal place', () => {
      const result = fmtNum(500);
      expect(result).toBe('500.0');
    });

    test('formats 999.9 with 1 decimal place', () => {
      const result = fmtNum(999.9);
      expect(result).toBe('999.9');
    });

    test('formats 123.456 rounded to 1 decimal', () => {
      const result = fmtNum(123.456);
      expect(result).toBe('123.5');
    });

    test('formats negative medium numbers', () => {
      const result = fmtNum(-250.7);
      expect(result).toBe('-250.7');
    });
  });

  describe('small numbers (>= 10 and < 100)', () => {
    test('formats 10 with 2 decimal places', () => {
      const result = fmtNum(10);
      expect(result).toBe('10.00');
    });

    test('formats 50.5 with 2 decimal places', () => {
      const result = fmtNum(50.5);
      expect(result).toBe('50.50');
    });

    test('formats 99.999 rounded to 2 decimals', () => {
      const result = fmtNum(99.999);
      expect(result).toBe('100.00');
    });

    test('formats 42.1234 rounded to 2 decimals', () => {
      const result = fmtNum(42.1234);
      expect(result).toBe('42.12');
    });

    test('formats negative small numbers', () => {
      const result = fmtNum(-15.75);
      expect(result).toBe('-15.75');
    });
  });

  describe('very small numbers (< 10)', () => {
    test('formats 0 with 2 decimal places', () => {
      const result = fmtNum(0);
      expect(result).toBe('0.00');
    });

    test('formats 5 with 2 decimal places', () => {
      const result = fmtNum(5);
      expect(result).toBe('5.00');
    });

    test('formats 9.999 rounded to 2 decimals', () => {
      const result = fmtNum(9.999);
      expect(result).toBe('10.00');
    });

    test('formats 3.14159 rounded to 2 decimals', () => {
      const result = fmtNum(3.14159);
      expect(result).toBe('3.14');
    });

    test('formats 0.123 with 2 decimal places', () => {
      const result = fmtNum(0.123);
      expect(result).toBe('0.12');
    });

    test('formats negative very small numbers', () => {
      const result = fmtNum(-7.89);
      expect(result).toBe('-7.89');
    });

    test('formats very small decimal', () => {
      const result = fmtNum(0.001);
      expect(result).toBe('0.00');
    });
  });

  describe('edge cases', () => {
    test('formats exact boundary at 10', () => {
      expect(fmtNum(9.99)).toBe('9.99');
      expect(fmtNum(10.0)).toBe('10.00');
    });

    test('formats exact boundary at 100', () => {
      expect(fmtNum(99.99)).toBe('99.99');
      expect(fmtNum(100.0)).toBe('100.0');
    });

    test('formats exact boundary at 1000 integer', () => {
      const result = fmtNum(1000);
      expect(result).toMatch(/1[,\s.]000/);
    });

    test('formats exact boundary at 1000 float', () => {
      const result = fmtNum(1000.5);
      expect(result).toMatch(/1[,\s.]000[.,]5/);
    });
  });

  describe('invalid inputs', () => {
    test('returns string representation of NaN', () => {
      const result = fmtNum(NaN);
      expect(result).toBe('NaN');
    });

    test('returns string representation of Infinity', () => {
      const result = fmtNum(Infinity);
      expect(result).toBe('Infinity');
    });

    test('returns string representation of -Infinity', () => {
      const result = fmtNum(-Infinity);
      expect(result).toBe('-Infinity');
    });

    test('handles null by converting to string', () => {
      const result = fmtNum(null);
      // null converts to 0
      expect(result).toBe('0.00');
    });

    test('handles undefined by returning string', () => {
      const result = fmtNum(undefined);
      expect(result).toBe('undefined');
    });

    test('handles string numbers', () => {
      const result = fmtNum('123.45');
      expect(result).toBe('123.5');
    });

    test('handles non-numeric strings', () => {
      const result = fmtNum('hello');
      expect(result).toBe('hello');
    });

    test('handles objects', () => {
      const result = fmtNum({});
      expect(result).toBe('[object Object]');
    });

    test('handles arrays', () => {
      const result = fmtNum([123]);
      expect(result).toBe('123.0');
    });
  });

  describe('negative numbers', () => {
    test('handles negative numbers across all ranges', () => {
      expect(fmtNum(-5)).toBe('-5.00');
      expect(fmtNum(-50)).toBe('-50.00');
      expect(fmtNum(-500)).toBe('-500.0');
    });

    test('absolute value determines formatting', () => {
      // -1500 has abs >= 1000, should use locale
      const result = fmtNum(-1500);
      expect(result).toMatch(/-1[,\s.]500/);
    });
  });
});

describe('esc', () => {
  describe('basic HTML escaping', () => {
    test('escapes ampersand', () => {
      expect(esc('&')).toBe('&amp;');
    });

    test('escapes less than', () => {
      expect(esc('<')).toBe('&lt;');
    });

    test('escapes greater than', () => {
      expect(esc('>')).toBe('&gt;');
    });

    test('escapes double quotes', () => {
      expect(esc('"')).toBe('&quot;');
    });

    test('escapes single quotes', () => {
      expect(esc("'")).toBe('&#039;');
    });
  });

  describe('multiple special characters', () => {
    test('escapes HTML tag', () => {
      expect(esc('<div>')).toBe('&lt;div&gt;');
    });

    test('escapes HTML tag with attributes', () => {
      expect(esc('<div class="test">')).toBe('&lt;div class=&quot;test&quot;&gt;');
    });

    test('escapes script tag', () => {
      expect(esc('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('escapes mixed special characters', () => {
      expect(esc('Tom & Jerry < 5 > 3 "quote" \'single\''))
        .toBe('Tom &amp; Jerry &lt; 5 &gt; 3 &quot;quote&quot; &#039;single&#039;');
    });

    test('escapes ampersand in entity', () => {
      // Should escape the ampersand even if it looks like an entity
      expect(esc('&lt;')).toBe('&amp;lt;');
    });
  });

  describe('normal text', () => {
    test('returns unchanged text without special chars', () => {
      expect(esc('Hello World')).toBe('Hello World');
    });

    test('preserves numbers', () => {
      expect(esc('12345')).toBe('12345');
    });

    test('preserves alphanumeric with spaces', () => {
      expect(esc('The quick brown fox 123')).toBe('The quick brown fox 123');
    });

    test('preserves special allowed characters', () => {
      expect(esc('hello-world_test.file')).toBe('hello-world_test.file');
    });
  });

  describe('edge cases', () => {
    test('handles empty string', () => {
      expect(esc('')).toBe('');
    });

    test('handles string with only spaces', () => {
      expect(esc('   ')).toBe('   ');
    });

    test('handles repeated special characters', () => {
      expect(esc('&&&&')).toBe('&amp;&amp;&amp;&amp;');
      expect(esc('<<<<')).toBe('&lt;&lt;&lt;&lt;');
    });

    test('handles newlines and tabs', () => {
      expect(esc('line1\nline2\ttab')).toBe('line1\nline2\ttab');
    });
  });

  describe('type coercion', () => {
    test('converts numbers to string', () => {
      expect(esc(123)).toBe('123');
    });

    test('converts boolean to string', () => {
      expect(esc(true)).toBe('true');
      expect(esc(false)).toBe('false');
    });

    test('converts null to string', () => {
      expect(esc(null)).toBe('null');
    });

    test('converts undefined to string', () => {
      expect(esc(undefined)).toBe('undefined');
    });

    test('converts objects to string', () => {
      expect(esc({})).toBe('[object Object]');
    });

    test('converts arrays to string', () => {
      expect(esc([1, 2, 3])).toBe('1,2,3');
    });
  });

  describe('XSS prevention', () => {
    test('prevents script injection', () => {
      const malicious = '<script>alert(document.cookie)</script>';
      const escaped = esc(malicious);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    test('prevents onclick injection', () => {
      const malicious = '<img src=x onerror="alert(1)">';
      const escaped = esc(malicious);
      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;img');
      expect(escaped).toContain('&quot;');
    });

    test('prevents data URI injection', () => {
      const malicious = '<a href="javascript:alert(1)">click</a>';
      const escaped = esc(malicious);
      expect(escaped).not.toContain('<a');
      expect(escaped).toContain('&lt;a');
    });

    test('prevents style injection', () => {
      const malicious = '<style>body{background:url("javascript:alert(1)")}</style>';
      const escaped = esc(malicious);
      expect(escaped).not.toContain('<style>');
      expect(escaped).toContain('&lt;style&gt;');
    });
  });

  describe('real-world municipality names', () => {
    test('handles municipality name with no special chars', () => {
      expect(esc('Johannesburg')).toBe('Johannesburg');
    });

    test('handles municipality name with spaces', () => {
      expect(esc('Cape Town')).toBe('Cape Town');
    });

    test('handles municipality name with hyphens', () => {
      expect(esc('Port Elizabeth')).toBe('Port Elizabeth');
    });

    test('handles municipality code with slashes', () => {
      // If codes have slashes or special chars
      expect(esc('CPT/001 & JHB/002')).toBe('CPT/001 &amp; JHB/002');
    });
  });
});
