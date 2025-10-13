// src/components/legend/Legend.jsx
import React, { useMemo } from "react";
import { fmtNum } from "../../utils/format";

/**
 * Props:
 *  - bins: Array<{ min: number, max: number, color: string }>
 *  - unit: string | null
 *  - reverseColors: boolean
 *  - onToggleReverse: (checked: boolean) => void
 *  - fixAcrossPeriods: boolean
 *  - onToggleFixAcrossPeriods: (checked: boolean) => void
 */
export default function Legend({
  bins = [],
  unit = null,
  reverseColors = false,
  onToggleReverse,
  fixAcrossPeriods = false,
  onToggleFixAcrossPeriods,
}) {
  // Build legend labels exactly like in App.js
  const legend = useMemo(() => {
    if (!bins.length) return [];
    const arr = [...bins].sort((a, b) => b.min - a.min); // highest first
    return arr.map((b) => ({
      color: b.color,
      label: `${fmtNum(b.min)} – ${fmtNum(b.max)}${unit ? ` ${unit}` : ""}`,
    }));
  }, [bins, unit]);

  return (
    <>
      {/* Legend header + reverse colours */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>Legend (log scale)</h3>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={reverseColors}
            onChange={(e) => onToggleReverse?.(e.target.checked)}
          />
          <span>Reverse colours</span>
        </label>
      </div>

      {/* Compare across years (uses your details-row styling) */}
      <div className="detail-row" style={{ margin: "8px 0 12px" }}>
        <div className="detail-key">Compare years</div>
        <div className="detail-value">
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={fixAcrossPeriods}
              onChange={(e) => onToggleFixAcrossPeriods?.(e.target.checked)}
            />
            <span>Use the same min/max across all periods</span>
          </label>
        </div>
      </div>

      {/* Legend swatches (same structure & inline styles as before) */}
      <div style={{ display: "grid", gap: 8 }}>
        {legend.map((l, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 12,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: l.color,
              }}
            />
            <span style={{ fontSize: 13 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
