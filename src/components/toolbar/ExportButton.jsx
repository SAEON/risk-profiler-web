// src/components/toolbar/ExportButton.jsx
import React, { useState } from "react";
import api from "../../lib/api";

/**
 * Props:
 *  - indicator:  string
 *  - period:     string | number
 *  - scenario?:  string
 *  - disabled?:  boolean
 */
export default function ExportButton({
  indicator = "",
  period = "",
  scenario,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const canExport = Boolean(api && indicator && period) && !disabled && !loading;

  const onExport = async () => {
    if (!canExport) return;
    setLoading(true);
    try {
      
      const blob = await api.downloadShapefile({
          indicator,
          period,
          ...(scenario ? { scenario } : {}),
        });

      const fname = `${indicator}_${period}${scenario ? "_" + scenario : ""}.zip`;

      // trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fname;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);

      // Parse error message for better user feedback
      let errorMsg = err?.message || String(err);

      if (errorMsg.includes("ogr2ogr")) {
        errorMsg = "Server configuration error: GDAL/ogr2ogr not found. Please contact administrator.";
      } else if (errorMsg.includes("ENOENT")) {
        errorMsg = "Server error: Required export tool not available. Please contact administrator.";
      } else if (errorMsg.includes("timeout") || errorMsg.includes("ETIMEDOUT")) {
        errorMsg = "Export timed out. Please try again or contact administrator.";
      } else if (errorMsg.includes("ECONNREFUSED")) {
        errorMsg = "Cannot connect to server. Please check your connection.";
      }

      alert(`Export failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="nice-select"
      onClick={onExport}
      disabled={!canExport}
      title={!indicator || !period ? "Select period & indicator first" : "Download shapefile (.zip)"}
      style={{ cursor: canExport ? "pointer" : "not-allowed" }}
    >
      {loading ? "Exporting…" : "Export shapefile"}
    </button>
  );
}
