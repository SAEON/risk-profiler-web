// src/lib/api.js

// Base URL (same as before) — set REACT_APP_API_URL in your .env
const RAW_API_BASE = process.env.REACT_APP_API_URL || "/crime-profiler/api";

// Convert to absolute URL if needed
export const API_BASE = RAW_API_BASE.startsWith('http')
  ? RAW_API_BASE
  : `${window.location.origin}${RAW_API_BASE}`;

/** Build a URL from path + params against API_BASE */
function buildUrl(path, params) {
  // Remove leading slash from path to make it relative to API_BASE
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, API_BASE.endsWith('/') ? API_BASE : API_BASE + '/');
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url;
}

/** JSON GET helper (unchanged idea, just inlined) */
export async function getJson(path, params) {
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

/** Blob GET helper (for downloads) */
export async function getBlob(path, params) {
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.blob();
}

/* =====================  Catalog  ===================== */
export const api = {
  // /catalog/periods -> [{ period, label }]
  getPeriods: () => getJson("/catalog/periods"),

  // /catalog/themes?kind=indicator|sub_index&period=YYYY -> [theme,...]
  getThemes: (params /* { kind, period } */) =>
    getJson("/catalog/themes", params),

  // /catalog/indicators?kind=&theme=&period= -> [{ key, label, ... }]
  getIndicators: (params /* { kind, theme, period } */) =>
    getJson("/catalog/indicators", params),

  // /catalog/municipalities -> [{ code,name,bbox:[minx,miny,maxx,maxy] }]
  getMunicipalities: () => getJson("/catalog/municipalities"),

  /* ===================  Choropleth  =================== */
  // /choropleth/indicator/:indicatorKey?period=&bbox=&scenario=&extent=
  getChoropleth: (
    indicatorKey,
    params /* { period, bbox, scenario, extent } */
  ) =>
    getJson(
      `/choropleth/indicator/${encodeURIComponent(indicatorKey)}`,
      params
    ),

  /* =====================  Search  ===================== */
  // /search/municipalities?q= -> top matches
  searchMunicipalities: (q) => getJson("/search/municipalities", { q }),

  /* =====================  Export  ===================== */
  // /export/shapefile?indicator=&period=&scenario= -> Blob (.zip)
  downloadShapefile: async (params /* { indicator, period, scenario } */) => {
    const blob = await getBlob("/export/shapefile", params);
    return blob;
  },

  /* ======================  Tiles  ===================== */
  // Vector tile URL helper for the map
  tileURL: (z, x, y) => `${API_BASE}/tiles/${z}/${x}/${y}.mvt`,

  /* ==================  Import Crime Stats  =================== */
  // GET /import/crime-stats/themes -> { themes, totalThemes, totalIndicators }
  getImportThemes: () => getJson("/import/crime-stats/themes"),

  // GET /import/crime-stats/template?themes=Contact crimes,Sexual Offences&year=2024
  // Returns Excel file (Blob)
  downloadImportTemplate: async (themes, year) => {
    const params = { themes: themes.join(',') };
    if (year) params.year = year;
    const blob = await getBlob("/import/crime-stats/template", params);
    return blob;
  },

  // POST /import/crime-stats (multipart/form-data)
  // Returns { success, summary, details?, errors? }
  uploadCrimeStats: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = buildUrl("/import/crime-stats");
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text);
    }

    return res.json();
  },
};

export default api;
