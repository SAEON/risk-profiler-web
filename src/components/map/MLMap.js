import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { API_BASE } from "../../lib/api";
import { fmtNum, esc } from "../../utils/format";

const SOURCE_VEC = "lm";
const SOURCE_LAYER = "lm";
const LAYER_FILL = "lm-fill";
const LAYER_LINE = "lm-line";
const LAYER_HOVER = "lm-hover-outline";

/**
 * Props:
 * - data:  [{code, value}]
 * - bins:  [{min, color}]
 * - onViewChange: (bboxString, map) => void   // fired on load and moveend/zoomend
 */
export default function MLMap({ data = [], bins = [], onViewChange }) {
  const mapRef = useRef(null);
  const divRef = useRef(null);
  const popupRef = useRef(null);
  const dataRef = useRef(data); // keep latest data for hover
  dataRef.current = data;

  // build color expression
  const buildMatch = (rows, thresholds) => {
    const valid = rows.filter((r) => Number.isFinite(Number(r.value)));
    if (!valid.length) return ["to-color", "#cbd5e1"]; // constant fallback
    const T = [...thresholds].sort((a, b) => b.min - a.min);
    const colorFor = (v) => {
      const n = Number(v);
      for (const b of T) if (n >= Number(b.min)) return b.color;
      return "#cbd5e1";
    };
    const expr = ["match", ["get", "code"]];
    for (const { code, value } of valid) {
      expr.push(String(code), colorFor(value));
    }
    expr.push("#cbd5e1");
    return expr;
  };

  // compute bbox string from map
  const getBboxStr = (map) => {
    const b = map.getBounds();
    // keep more precision
    return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
      .map((n) => n.toFixed(7))
      .join(",");
  };

  // init map
  useEffect(() => {
    const map = new maplibregl.Map({
      container: divRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
          [SOURCE_VEC]: {
            type: "vector",
            tiles: [`${API_BASE}/tiles/{z}/{x}/{y}.mvt`],
            minzoom: 0,
            maxzoom: 14,
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          {
            id: LAYER_FILL,
            type: "fill",
            source: SOURCE_VEC,
            "source-layer": SOURCE_LAYER,
            paint: { "fill-color": "#cbd5e1", "fill-opacity": 0.75 },
          },
          {
            id: LAYER_LINE,
            type: "line",
            source: SOURCE_VEC,
            "source-layer": SOURCE_LAYER,
            paint: { "line-color": "#1f2937", "line-width": 0.8 },
          },
          {
            id: LAYER_HOVER,
            type: "line",
            source: SOURCE_VEC,
            "source-layer": SOURCE_LAYER,
            filter: ["==", ["get", "code"], "__none__"],
            paint: { "line-color": "#111827", "line-width": 2.0 },
          },
        ],
      },
      center: [22.9, -28.75],
      zoom: 4.7,
    });

    map.on("load", () => {
      // initial bbox → inform parent so it can fetch
      onViewChange?.(getBboxStr(map), map);

      // mousemove hover popup (uses latest dataRef)
      map.on("mousemove", LAYER_FILL, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const code = String(f.properties.code);
        map.setFilter(LAYER_HOVER, ["==", ["get", "code"], code]);

        const rec = dataRef.current.find((d) => String(d.code) === code);
        const val =
          rec && Number.isFinite(Number(rec.value)) ? Number(rec.value) : null;

        const html = `
          <div style="font-weight:600">${esc(f.properties.name)}</div>
          <div style="color:#64748b; font-size:12px">${esc(code)}</div>
          <div style="margin-top:4px">${
            val == null ? "No data" : fmtNum(val)
          }</div>
        `;
        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 8,
          });
        }
        popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
      });

      map.on("mouseleave", LAYER_FILL, () => {
        map.setFilter(LAYER_HOVER, ["==", ["get", "code"], "__none__"]);
        if (popupRef.current) popupRef.current.remove();
      });

      // debounced move handler
      let t = null;
      const fire = () => onViewChange?.(getBboxStr(map), map);
      const debounced = () => {
        clearTimeout(t);
        t = setTimeout(fire, 140);
      };
      map.on("moveend", debounced);
      map.on("zoomend", debounced);
    });

    mapRef.current = map;
    return () => {
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recolor on data/bins change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(LAYER_FILL)) return;
    const expr = buildMatch(data, bins);
    map.setPaintProperty(LAYER_FILL, "fill-color", expr);
  }, [data, bins]);

  return <div ref={divRef} className="map-canvas" />;
}

