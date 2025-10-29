// src/components/import/ThemeSelector.jsx
import React, { useEffect, useState } from "react";
import api from "../../lib/api";

/**
 * Step 1: Theme Selection
 * Fetches crime themes and allows user to select one or more
 * Props:
 *  - onThemesSelected: (themes) => void - Callback when user clicks Next
 */
export default function ThemeSelector({ onThemesSelected }) {
  const [themes, setThemes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getImportThemes();
        setThemes(data.themes || []);
      } catch (err) {
        console.error("Failed to fetch import themes:", err);
        setError(err.message || "Failed to load themes");
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Toggle theme selection
  const handleToggleTheme = (themeName) => {
    setSelectedThemes((prev) =>
      prev.includes(themeName)
        ? prev.filter((t) => t !== themeName)
        : [...prev, themeName]
    );
  };

  // Handle Next button
  const handleNext = () => {
    if (selectedThemes.length > 0) {
      onThemesSelected(selectedThemes);
    }
  };

  // Calculate total indicators for selected themes
  const totalIndicators = themes
    .filter((t) => selectedThemes.includes(t.theme))
    .reduce((sum, t) => sum + t.count, 0);

  if (loading) {
    return (
      <div className="theme-selector loading">
        <p>Loading crime themes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-selector error">
        <p className="error-message">Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="theme-selector">
      <h2>Select Crime Themes</h2>
      <p className="instructions">
        Choose one or more crime themes to download an Excel template for data import.
      </p>

      <div className="theme-grid">
        {themes.map((themeData) => {
          const isSelected = selectedThemes.includes(themeData.theme);

          return (
            <div
              key={themeData.theme}
              className={`theme-card ${isSelected ? "selected" : ""}`}
              onClick={() => handleToggleTheme(themeData.theme)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleTheme(themeData.theme)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="theme-content">
                <h3>{themeData.theme}</h3>
                <span className="indicator-badge">{themeData.count} indicators</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="selection-summary">
        <p>
          <strong>{selectedThemes.length}</strong> theme{selectedThemes.length !== 1 ? "s" : ""} selected
          {selectedThemes.length > 0 && (
            <span> ({totalIndicators} indicator{totalIndicators !== 1 ? "s" : ""})</span>
          )}
        </p>
      </div>

      <div className="actions">
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={selectedThemes.length === 0}
        >
          Next: Download Template
        </button>
      </div>
    </div>
  );
}
