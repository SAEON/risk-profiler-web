// src/components/details/DetailsPanel.jsx
import React from "react";

/**
 * Props:
 *  - meta: {
 *      label: string,
 *      unit: string | null,
 *      description: string,
 *      source_name: string,
 *      source_url: string
 *    }
 *  - period: string | number
 */
export default React.memo(function DetailsPanel({ meta, period }) {
  if (!meta) return null;

  const label = meta.label || "";
  const unit = meta.unit ?? null;
  const description = meta.description || "";
  const sourceName = meta.source_name || "";
  const sourceUrl = meta.source_url || "";

  return (
    <>
      {/* Selected */}
      <div className="detail-row">
        <div className="detail-key">Selected</div>
        <div className="detail-value">
          <div style={{ fontWeight: 600 }}>{label || "—"}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>
            {period ? `Period: ${period}` : ""}
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="detail-row">
        <div className="detail-key">Units</div>
        <div className="detail-value">{unit || "—"}</div>
      </div>

      {/* Description */}
      <div className="detail-row">
        <div className="detail-key">Description</div>
        <div className="detail-value">{description || "—"}</div>
      </div>

      {/* Source */}
      <div className="detail-row">
        <div className="detail-key">Source</div>
        <div className="detail-value">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={sourceName || sourceUrl}
              style={{ color: "#0ea5e9" }}
            >
              {sourceName || sourceUrl}
            </a>
          ) : (
            sourceName || "—"
          )}
        </div>
      </div>
    </>
  );
});
