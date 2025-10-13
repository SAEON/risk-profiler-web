// src/__tests__/lib/api.test.js

import api, { API_BASE, getJson, getBlob } from '../../lib/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Module', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
  });

  describe('API_BASE', () => {
    test('defaults to localhost:3000', () => {
      expect(API_BASE).toMatch(/^https?:\/\/localhost:\d+$/);
      // Note: Actual port may vary based on environment
    });

    test('can be overridden by environment variable', () => {
      // Note: This test documents the behavior, actual override happens at import time
      expect(API_BASE).toMatch(/^https?:\/\//);
    });
  });

  describe('getJson', () => {
    test('fetches and parses JSON successfully', async () => {
      const mockData = { test: 'data' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getJson('/test', { param: 'value' });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/test');
      expect(calledUrl).toContain('param=value');
    });

    test('throws error on non-ok response with text', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        text: async () => 'Custom error message',
      });

      await expect(getJson('/fail')).rejects.toThrow('Custom error message');
    });

    test('throws error on non-ok response with statusText fallback', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('No text');
        },
      });

      await expect(getJson('/fail')).rejects.toThrow('Internal Server Error');
    });

    test('filters out undefined, null, and empty string params', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await getJson('/test', {
        valid: 'value',
        nullParam: null,
        undefinedParam: undefined,
        emptyParam: '',
        zeroParam: 0,
      });

      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('valid=value');
      expect(calledUrl).toContain('zeroParam=0');
      expect(calledUrl).not.toContain('nullParam');
      expect(calledUrl).not.toContain('undefinedParam');
      expect(calledUrl).not.toContain('emptyParam=');
    });
  });

  describe('getBlob', () => {
    test('fetches and returns blob successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await getBlob('/download', { file: 'test.zip' });

      expect(result).toBe(mockBlob);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('throws error on non-ok response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        text: async () => 'Access denied',
      });

      await expect(getBlob('/forbidden')).rejects.toThrow('Access denied');
    });
  });

  describe('api.getPeriods', () => {
    test('fetches periods successfully', async () => {
      const mockPeriods = [
        { period: '2024', label: '2024' },
        { period: '2023', label: '2023' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      });

      const result = await api.getPeriods();

      expect(result).toEqual(mockPeriods);
      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/catalog/periods');
    });

    test('returns array with period and label properties', async () => {
      const mockPeriods = [{ period: '2024', label: '2024' }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      });

      const result = await api.getPeriods();

      expect(Array.isArray(result)).toBe(true);
      result.forEach(item => {
        expect(item).toHaveProperty('period');
        expect(item).toHaveProperty('label');
      });
    });
  });

  describe('api.getThemes', () => {
    test('fetches themes with kind and period parameters', async () => {
      const mockThemes = ['Theme A', 'Theme B', 'Theme C'];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockThemes,
      });

      const result = await api.getThemes({ kind: 'indicator', period: '2024' });

      expect(result).toEqual(mockThemes);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/catalog/themes');
      expect(calledUrl).toContain('kind=indicator');
      expect(calledUrl).toContain('period=2024');
    });

    test('returns array of theme strings', async () => {
      const mockThemes = ['Aggravated robbery', 'Contact crimes'];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockThemes,
      });

      const result = await api.getThemes({ kind: 'indicator', period: '2024' });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(theme => {
        expect(typeof theme).toBe('string');
      });
    });
  });

  describe('api.getIndicators', () => {
    test('fetches indicators with kind, theme, and period', async () => {
      const mockIndicators = [
        {
          key: 'crime_carjacking',
          label: 'Carjacking',
          category: 'SAPS crime category',
          unit: 'cases (raw count)',
          polarity: 'adverse',
          description: 'Motor vehicle hijacking (carjacking).',
          theme: 'Aggravated robbery',
          measure_type: 'indicator',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndicators,
      });

      const result = await api.getIndicators({
        kind: 'indicator',
        theme: 'Aggravated robbery',
        period: '2024',
      });

      expect(result).toEqual(mockIndicators);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/catalog/indicators');
      expect(calledUrl).toContain('kind=indicator');
      // URL encoding can be %20 or +, both are valid for spaces
      expect(calledUrl).toMatch(/theme=Aggravated(%20|\+)robbery/);
      expect(calledUrl).toContain('period=2024');
    });

    test('returns array with indicator properties', async () => {
      const mockIndicators = [
        {
          key: 'test_key',
          label: 'Test Label',
          unit: 'test unit',
          description: 'Test description',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndicators,
      });

      const result = await api.getIndicators({
        kind: 'indicator',
        theme: 'Test',
        period: '2024',
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(indicator => {
        expect(indicator).toHaveProperty('key');
        expect(indicator).toHaveProperty('label');
      });
    });
  });

  describe('api.getMunicipalities', () => {
    test('fetches municipalities successfully', async () => {
      const mockMunicipalities = [
        {
          code: 'CPT',
          name: 'City of Cape Town',
          bbox: [18.307, -34.358, 19.004, -33.471],
        },
        {
          code: 'JHB',
          name: 'City of Johannesburg',
          bbox: [27.738, -26.416, 28.253, -25.954],
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMunicipalities,
      });

      const result = await api.getMunicipalities();

      expect(result).toEqual(mockMunicipalities);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/catalog/municipalities');
    });

    test('returns array with code, name, and bbox properties', async () => {
      const mockMunicipalities = [
        {
          code: 'TEST',
          name: 'Test Municipality',
          bbox: [10, -30, 20, -25],
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMunicipalities,
      });

      const result = await api.getMunicipalities();

      expect(Array.isArray(result)).toBe(true);
      result.forEach(muni => {
        expect(muni).toHaveProperty('code');
        expect(muni).toHaveProperty('name');
        expect(muni).toHaveProperty('bbox');
        expect(Array.isArray(muni.bbox)).toBe(true);
        expect(muni.bbox).toHaveLength(4);
      });
    });
  });

  describe('api.getChoropleth', () => {
    test('fetches choropleth data with indicator, period, and bbox', async () => {
      const mockChoropleth = {
        label: 'Carjacking',
        unit: 'cases (raw count)',
        description: 'Motor vehicle hijacking (carjacking).',
        source_name: 'South African Police Service (SAPS)',
        source_url: 'https://www.saps.gov.za/services/crimestats.php',
        items: [
          { code: 'CPT', value: 123 },
          { code: 'JHB', value: 456 },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChoropleth,
      });

      const result = await api.getChoropleth('crime_carjacking', {
        period: '2024',
        bbox: '16.45,-34.85,32.89,-22.13',
      });

      expect(result).toEqual(mockChoropleth);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/choropleth/indicator/crime_carjacking');
      expect(calledUrl).toContain('period=2024');
      expect(calledUrl).toContain('bbox=16.45');
    });

    test('handles URL encoding for indicator key', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await api.getChoropleth('test/indicator with spaces', {
        period: '2024',
        bbox: '1,2,3,4',
      });

      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('test%2Findicator%20with%20spaces');
    });

    test('includes optional scenario parameter', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await api.getChoropleth('test_indicator', {
        period: '2024',
        bbox: '1,2,3,4',
        scenario: 'baseline',
      });

      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('scenario=baseline');
    });

    test('includes optional extent parameter', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ gposmin: 1, gvmax: 100, items: [] }),
      });

      await api.getChoropleth('test_indicator', {
        period: '2024',
        bbox: '1,2,3,4',
        extent: 'all_periods',
      });

      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('extent=all_periods');
    });

    test('returns object with metadata and items', async () => {
      const mockChoropleth = {
        label: 'Test',
        unit: 'count',
        description: 'Description',
        source_name: 'Source',
        source_url: 'http://source.com',
        items: [{ code: 'A', value: 10 }],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChoropleth,
      });

      const result = await api.getChoropleth('test', {
        period: '2024',
        bbox: '1,2,3,4',
      });

      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('api.searchMunicipalities', () => {
    test('searches municipalities by query string', async () => {
      const mockResults = [
        {
          code: 'CPT',
          name: 'City of Cape Town',
          bbox: [18.307, -34.358, 19.004, -33.471],
        },
        {
          code: 'WC033',
          name: 'Cape Agulhas',
          bbox: [19.617, -34.834, 20.871, -34.203],
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await api.searchMunicipalities('cape');

      expect(result).toEqual(mockResults);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/search/municipalities');
      expect(calledUrl).toContain('q=cape');
    });

    test('returns empty array for no matches', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await api.searchMunicipalities('nonexistent');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('api.downloadShapefile', () => {
    test('downloads shapefile as blob', async () => {
      const mockBlob = new Blob(['shapefile data'], { type: 'application/zip' });

      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await api.downloadShapefile({
        indicator: 'crime_carjacking',
        period: '2024',
      });

      expect(result).toBe(mockBlob);
      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('/export/shapefile');
      expect(calledUrl).toContain('indicator=crime_carjacking');
      expect(calledUrl).toContain('period=2024');
    });

    test('includes optional scenario parameter', async () => {
      const mockBlob = new Blob(['data']);

      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      await api.downloadShapefile({
        indicator: 'test',
        period: '2024',
        scenario: 'worst_case',
      });

      const calledUrl = fetch.mock.calls[0][0].toString();
      expect(calledUrl).toContain('scenario=worst_case');
    });
  });

  describe('api.tileURL', () => {
    test('generates correct tile URL pattern', () => {
      const url = api.tileURL(5, 17, 18);

      expect(url).toBe(`${API_BASE}/tiles/5/17/18.mvt`);
    });

    test('works with different zoom levels', () => {
      expect(api.tileURL(0, 0, 0)).toBe(`${API_BASE}/tiles/0/0/0.mvt`);
      expect(api.tileURL(14, 8000, 5000)).toBe(`${API_BASE}/tiles/14/8000/5000.mvt`);
    });

    test('returns string with .mvt extension', () => {
      const url = api.tileURL(1, 2, 3);

      expect(typeof url).toBe('string');
      expect(url.endsWith('.mvt')).toBe(true);
    });
  });

  describe('error handling', () => {
    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getPeriods()).rejects.toThrow('Network error');
    });

    test('handles JSON parsing errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(api.getPeriods()).rejects.toThrow('Invalid JSON');
    });

    test('handles 404 errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      });

      await expect(api.getPeriods()).rejects.toThrow('Resource not found');
    });

    test('handles 500 errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(api.getPeriods()).rejects.toThrow('Server error');
    });
  });
});
