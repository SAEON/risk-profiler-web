// src/components/import/TemplateDownload.jsx
import React, { useState } from "react";
import api from "../../lib/api";

/**
 * Step 2: Download Template
 * Allows user to download Excel template for selected themes
 * Props:
 *  - selectedThemes: string[] - Array of theme names
 *  - onTemplateDownloaded: () => void - Callback when user clicks Next
 *  - onBack: () => void - Callback to go back to theme selection
 */
export default function TemplateDownload({ selectedThemes, onTemplateDownloaded, onBack }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState("");

  // Handle download
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      const blob = await api.downloadImportTemplate(selectedThemes, year || null);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const themesSlug = selectedThemes
        .map((t) => t.replace(/[^a-z0-9]/gi, "_").toLowerCase())
        .join("-");
      const yearSuffix = year ? `_${year}` : "";
      link.download = `crime-stats-template-${themesSlug}${yearSuffix}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloaded(true);
    } catch (err) {
      console.error("Failed to download template:", err);
      setError(err.message || "Failed to download template");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="template-download">
      <h2>Download Excel Template</h2>
      <p className="instructions">
        Download the Excel template for the selected crime themes. Fill in the data and upload it in the next step.
      </p>

      <div className="selected-themes">
        <h3>Selected Themes:</h3>
        <ul>
          {selectedThemes.map((theme) => (
            <li key={theme}>
              <span className="theme-chip">{theme}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="year-input">
        <label htmlFor="year">
          Year (optional):
          <input
            id="year"
            type="number"
            min="2000"
            max="2100"
            placeholder="e.g., 2024"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={downloading}
          />
        </label>
        <p className="hint">Leave blank to use the default year in the template.</p>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {downloaded && (
        <div className="success-message">
          <p>✓ Template downloaded successfully!</p>
          <p className="hint">Fill in the Excel file and proceed to upload it.</p>
        </div>
      )}

      <div className="download-section">
        <button
          className="btn-download"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download Template"}
        </button>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={onTemplateDownloaded}
          disabled={!downloaded}
        >
          Next: Upload Data
        </button>
      </div>
    </div>
  );
}
