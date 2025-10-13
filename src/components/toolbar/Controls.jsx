// src/components/toolbar/Controls.jsx
import React from "react";

/**
 * Props:
 * periods:       Array<{ period: string|number, label?: string }>
 * themes:        Array<string>
 * indicators:    Array<{ key: string, label?: string }>
 * period:        string|number
 * measure:       'indicator' | 'sub_index' | 'index'
 * theme:         string
 * indicator:     string
 * hasSubIndexForPeriod: boolean
 * onChangePeriod, onChangeMeasure, onChangeTheme, onChangeIndicator: (val) => void
 */
function Controls({
  periods = [],
  themes = [],
  indicators = [],
  period = "",
  measure = "indicator",
  theme = "",
  indicator = "",
  hasSubIndexForPeriod = false,
  onChangePeriod,
  onChangeMeasure,
  onChangeTheme,
  onChangeIndicator,
}) {
  const handlePeriod = (e) => onChangePeriod?.(e.target.value || "");
  const handleMeasure = (e) => onChangeMeasure?.(e.target.value || "indicator");
  const handleTheme = (e) => onChangeTheme?.(e.target.value || "");
  const handleIndicator = (e) => onChangeIndicator?.(e.target.value || "");

  const subIndexDisabled = !hasSubIndexForPeriod;
  const indexDisabled = true; // intentionally unsupported for now

  return (
    <div className="toolbar toolbar--controls" aria-label="Indicator Controls">
      {/* Period */}
      <div className="group group--vertical">
        <label htmlFor="period-select">Period</label>
        <select
          id="period-select"
          className="nice-select"
          value={period ?? ""}
          onChange={handlePeriod}
        >
          <option value="">Select…</option>
          {periods.map((p) => (
            <option key={String(p.period)} value={p.period}>
              {p.label ?? p.period}
            </option>
          ))}
        </select>
      </div>

      {/* Measure */}
      <div className="group group--vertical">
        <label htmlFor="measure-select">Measure</label>
        <select
          id="measure-select"
          className="nice-select"
          value={measure}
          onChange={handleMeasure}
        >
          <option value="indicator">Indicator</option>
          <option value="sub_index" disabled={subIndexDisabled}>
            Sub-index {subIndexDisabled ? "(unavailable)" : ""}
          </option>
          <option value="index" disabled={indexDisabled}>Index</option>
        </select>
      </div>

      {/* Theme */}
      <div className="group group--vertical">
        <label htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          className="nice-select"
          value={theme}
          onChange={handleTheme}
          disabled={!period || measure === "index" || themes.length === 0}
        >
          <option value="">Select…</option>
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Indicator */}
      <div className="group group--vertical">
        <label htmlFor="indicator-select">Indicator</label>
        <select
          id="indicator-select"
          className="nice-select"
          value={indicator}
          onChange={handleIndicator}
          disabled={
            !period ||
            measure === "index" ||
            !theme ||
            indicators.length === 0
          }
        >
          <option value="">Select…</option>
          {indicators.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label || i.key}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default React.memo(Controls);
