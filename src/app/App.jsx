// src/app/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/App.css";

// Centralized API
import api from "../lib/api";

// Core map + extracted UI
import MLMap from "../components/map/MLMap";
import Controls from "../components/toolbar/Controls";
import ExportButton from "../components/toolbar/ExportButton";
import MunicipalitySearch from "../components/search/MunicipalitySearch";
import Legend from "../components/legend/Legend";
import DetailsPanel from "../components/details/DetailsPanel";

// Shared utils
import { makeLogBinsFromRange, buildLogEqualBinsIncludingZero } from "../utils/bins";
import { basePalette } from "../utils/palette";

// Constants (kept local; matches original behavior)
const FULL_BBOX = "16.45,-34.85,32.89,-22.13";

export default function App() {
  const mapRef = useRef(null);

  // catalogs
  const [periods, setPeriods] = useState([]);

  // measure-aware catalogs
  const [themes, setThemes] = useState([]);
  const [indicators, setIndicators] = useState([]);

  // controls
  const [period, setPeriod] = useState("");
  const [measure, setMeasure] = useState("indicator"); // 'indicator' | 'sub_index' | 'index'(disabled)
  const [theme, setTheme] = useState("");
  const [indicator, setIndicator] = useState("");

  // availability flags (by period)
  const [hasSubIndexForPeriod, setHasSubIndexForPeriod] = useState(false);

  // viewport data
  const [items, setItems] = useState([]); // [{code,value}]

  // meta for selected indicator
  const [meta, setMeta] = useState({
    label: "",
    unit: null,
    description: "",
    source_name: "",
    source_url: "",
  });

  // global distribution (for dynamic bins)
  const [globalValues, setGlobalValues] = useState([]); // sorted number[]

  // optional: fix scale across periods (use gvmax/gposmin across all periods)
  const [fixAcrossPeriods, setFixAcrossPeriods] = useState(false);
  const [globalRange, setGlobalRange] = useState({ gposmin: null, gvmax: null });

  // color direction
  const [reverseColors, setReverseColors] = useState(false);

  // current bbox string from map
  const [bboxStr, setBboxStr] = useState("");

  /* ------------------------------- Bootstrapping ------------------------------ */

  // Load periods once
  useEffect(() => {
    (async () => {
      try {
        const p = await api.getPeriods();
        // Sort periods descending so the latest is selected by default
        p.sort((a, b) =>
          String(b.label || b.period).localeCompare(String(a.label || a.period))
        );
        setPeriods(p);
        if (!period && p.length) setPeriod(p[0].period);
      } catch (e) {
        console.error("Catalog periods error:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------- Availability by period -------------------------- */

  // Check if sub-index exists for the selected period; disable option if not.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!period) {
          setHasSubIndexForPeriod(false);
          return;
        }
        const th = await api.getThemes({ kind: "sub_index", period });
        if (!active) return;
        const hasAny = Array.isArray(th) && th.length > 0;
        setHasSubIndexForPeriod(hasAny);
        if (!hasAny && measure === "sub_index") setMeasure("indicator");
      } catch (e) {
        if (!active) return;
        console.error("Check sub_index availability failed:", e);
        setHasSubIndexForPeriod(false);
        if (measure === "sub_index") setMeasure("indicator");
      }
    })();
    return () => {
      active = false;
    };
  }, [period, measure]);

  /* ------------------- Themes & indicators (period-aware) -------------------- */

  // THEMES for the selected measure **and** period (preserve current theme if valid)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!period || measure === "index") {
          if (!active) return;
          setThemes([]);
          setTheme("");
          return;
        }
        const th = await api.getThemes({ kind: measure, period });
        if (!active) return;
        th.sort((a, b) => String(a).localeCompare(String(b)));
        setThemes(th);
        setTheme((cur) => (th.includes(cur) ? cur : th[0] ?? ""));
      } catch (e) {
        if (!active) return;
        console.error("Themes load error:", e);
        setThemes([]);
        setTheme("");
      }
    })();
    return () => {
      active = false;
    };
  }, [measure, period]);

  // INDICATORS/SUB-INDICES for current measure + theme + period (preserve indicator if valid)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!period || !theme || measure === "index") {
          if (!active) return;
          setIndicators([]);
          setIndicator("");
          return;
        }
        const list = await api.getIndicators({ kind: measure, theme, period });
        if (!active) return;
        list.sort((a, b) =>
          String(a.label || a.key).localeCompare(String(b.label || b.key))
        );
        setIndicators(list);
        setIndicator((cur) =>
          list.some((x) => x.key === cur) ? cur : list[0]?.key ?? ""
        );
      } catch (e) {
        if (!active) return;
        console.error("Indicator catalog error:", e);
        setIndicators([]);
        setIndicator("");
      }
    })();
    return () => {
      active = false;
    };
  }, [measure, theme, period]);

  /* ------------------------- Data fetch for viewport map ---------------------- */

  const fetchChoropleth = async (bboxOverride) => {
    if (measure === "index") {
      setItems([]);
      setMeta({
        label: "",
        unit: null,
        description: "",
        source_name: "",
        source_url: "",
      });
      return;
    }
    if (!period || !indicator) return;

    const bbox = bboxOverride || bboxStr;
    if (!bbox) return;

    try {
      const json = await api.getChoropleth(indicator, { period, bbox });
      setItems(Array.isArray(json.items) ? json.items : []);
      setMeta({
        label: json.label || indicator,
        unit: json.unit ?? null,
        description: json.description ?? "",
        source_name: json.source_name ?? "",
        source_url: json.source_url ?? "",
      });
    } catch (e) {
      console.error("Choropleth error:", e);
      setItems([]);
      setMeta({
        label: indicator,
        unit: null,
        description: "",
        source_name: "",
        source_url: "",
      });
    }
  };

  // map → app (called on load/pan/zoom)
  const handleViewChange = (bboxString, map) => {
    mapRef.current = map;
    setBboxStr(bboxString);
  };

  useEffect(() => {
    if (!bboxStr) return;
    fetchChoropleth(bboxStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bboxStr, period, measure, indicator]);

  /* ---------------------- Global extent for stable binning -------------------- */

  useEffect(() => {
    (async () => {
      if (measure === "index" || !period || !indicator) {
        setGlobalValues([]);
        setGlobalRange({ gposmin: null, gvmax: null });
        return;
      }
      try {
        const json = await api.getChoropleth(
          indicator,
          { period, bbox: FULL_BBOX, ...(fixAcrossPeriods ? { extent: "all_periods" } : {}) }
        );

        if (fixAcrossPeriods) {
          setGlobalRange({
            gposmin: Number(json.gposmin),
            gvmax: Number(json.gvmax),
          });
          setGlobalValues([]); // not used in fixed-across-periods mode
        } else {
          const vals = (json.items || [])
            .map((d) => Math.max(0, Number(d.value)))
            .filter(Number.isFinite)
            .sort((a, b) => a - b);
          setGlobalValues(vals);
          setGlobalRange({ gposmin: null, gvmax: null });
        }
      } catch (e) {
        console.error("Global extent error:", e);
        setGlobalValues([]);
        setGlobalRange({ gposmin: null, gvmax: null });
      }
    })();
  }, [period, indicator, measure, fixAcrossPeriods]);

  /* --------------------------------- Palette -------------------------------- */

  const palette = useMemo(
    () => (reverseColors ? [...basePalette].reverse() : basePalette),
    [reverseColors]
  );

  /* ------------------------------ Build the bins ----------------------------- */

  const bins = useMemo(() => {
    if (fixAcrossPeriods && Number.isFinite(globalRange.gvmax)) {
      const minsAsc = makeLogBinsFromRange(globalRange.gposmin, globalRange.gvmax, 10)
        .map((b) => b.min)
        .sort((a, b) => a - b);
      return minsAsc.map((min, i) => ({
        min,
        max: i < minsAsc.length - 1 ? minsAsc[i + 1] : globalRange.gvmax,
        color: palette[i],
      }));
    }

    const globalBins = buildLogEqualBinsIncludingZero(globalValues, 10);
    if (globalBins && globalValues.length) {
      const dataMax = globalValues[globalValues.length - 1];
      const minsAsc = globalBins.map((b) => b.min).sort((a, b) => a - b);
      return minsAsc.map((min, i) => ({
        min,
        max: i < minsAsc.length - 1 ? minsAsc[i + 1] : dataMax,
        color: palette[i],
      }));
    }

    const vals = items
      .map((d) => Math.max(0, Number(d.value)))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    if (!vals.length) {
      const step = 100 / 10;
      return [...Array(10)].map((_, i) => ({
        min: i * step,
        max: i < 9 ? (i + 1) * step : 100,
        color: palette[i],
      }));
    }

    const pick = (p) => vals[Math.floor((vals.length - 1) * p)];
    const minsAsc = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(pick);
    const vMax = vals[vals.length - 1];
    return minsAsc.map((min, i) => ({
      min,
      max: i < minsAsc.length - 1 ? minsAsc[i + 1] : vMax,
      color: palette[i],
    }));
  }, [fixAcrossPeriods, globalRange, globalValues, items, palette]);

  /* ---------------------------- Search zoom helper --------------------------- */

  const handleZoomToMunicipality = (item) => {
    const b = item?.bbox;
    if (!mapRef.current || !b) return;
    const [[minx, miny], [maxx, maxy]] = [
      [b[0], b[1]],
      [b[2], b[3]],
    ];
    mapRef.current.fitBounds(
      [
        [minx, miny],
        [maxx, maxy],
      ],
      {
        padding: 32,
        duration: 600,
        linear: false,
      }
    );
  };

  /* ---------------------------------- Render -------------------------------- */

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand">SA Risk — Indicator Viewer</div>
      </header>

      <main className="App-main">
        <div className="map-shell">
          {/* Controls toolbar */}
          <Controls
            periods={periods}
            themes={themes}
            indicators={indicators}
            period={period}
            measure={measure}
            theme={theme}
            indicator={indicator}
            hasSubIndexForPeriod={hasSubIndexForPeriod}
            onChangePeriod={setPeriod}
            onChangeMeasure={setMeasure}
            onChangeTheme={setTheme}
            onChangeIndicator={setIndicator}
          />

          {/* Export */}
          <div className="group" style={{ alignSelf: "end" }}>
            <ExportButton
              indicator={indicator}
              period={period}
              disabled={!indicator || !period || measure === "index"}
            />
          </div>

          {/* Map */}
          <div className="card" style={{ padding: 0, flex: 1 }}>
            <MLMap bins={bins} data={items} onViewChange={handleViewChange} />
          </div>
        </div>

        {/* Right column */}
        <div className="card" style={{ overflowY: "auto" }}>
          <MunicipalitySearch onSelect={handleZoomToMunicipality} />

          <Legend
            bins={bins}
            unit={meta.unit}
            reverseColors={reverseColors}
            onToggleReverse={setReverseColors}
            fixAcrossPeriods={fixAcrossPeriods}
            onToggleFixAcrossPeriods={setFixAcrossPeriods}
          />

          {meta.label && measure !== "index" && (
            <DetailsPanel meta={meta} period={period} />
          )}
        </div>
      </main>
    </div>
  );
}
