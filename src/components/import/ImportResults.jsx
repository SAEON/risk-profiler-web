// src/components/import/ImportResults.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Step 4: Import Results
 * Displays success/error results from the import
 * Props:
 *  - result: { success, summary, details?, errors? }
 *  - onReset: () => void - Callback to start over
 */
export default function ImportResults({ result, onReset }) {
  const [sortColumn, setSortColumn] = useState("row");
  const [sortDirection, setSortDirection] = useState("asc");

  const { success, summary, details, errors } = result || {};

  // Sort errors
  const sortedErrors = errors
    ? [...errors].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const multiplier = sortDirection === "asc" ? 1 : -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * multiplier;
        }
        return String(aVal).localeCompare(String(bVal)) * multiplier;
      })
    : [];

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Export errors to CSV
  const downloadErrorReport = () => {
    if (!errors || errors.length === 0) return;

    const headers = ["Row", "Column", "Value", "Error"];
    const rows = errors.map((err) => [err.row, err.column, err.value, err.error]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `import-errors-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="import-results">
        <p>No results to display.</p>
      </div>
    );
  }

  return (
    <div className="import-results">
      {/* Success/Error Banner */}
      {success ? (
        <div className="banner success">
          <h2>✓ Import Successful!</h2>
          <p>Your crime statistics data has been imported successfully.</p>
          {summary && (
            <div className="banner-summary">
              <strong>
                {summary.rowsImported || 0} row{summary.rowsImported !== 1 ? 's' : ''} imported
                {summary.rowsUpdated > 0 && `, ${summary.rowsUpdated} updated`}
              </strong>
            </div>
          )}
          {details && (
            <div className="banner-details">
              {details.affectedIndicators && details.affectedIndicators.length > 0 && (
                <p>
                  <strong>{details.affectedIndicators.length}</strong> indicator{details.affectedIndicators.length !== 1 ? 's' : ''} updated
                </p>
              )}
              {details.affectedMunicipalities && details.affectedMunicipalities.length > 0 && (
                <p>
                  <strong>{details.affectedMunicipalities.length}</strong> municipalit{details.affectedMunicipalities.length !== 1 ? 'ies' : 'y'}
                </p>
              )}
              {details.periods && details.periods.length > 0 && (
                <p>
                  Period{details.periods.length !== 1 ? 's' : ''}: <strong>{details.periods.join(", ")}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="banner error">
          <h2>⚠ Import Completed with Errors</h2>
          <p>Some rows could not be imported. See details below.</p>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="summary-cards">
        {summary?.rowsImported !== undefined && (
          <div className="summary-card imported">
            <div className="card-value">{summary.rowsImported}</div>
            <div className="card-label">Rows Imported</div>
          </div>
        )}
        {summary?.rowsUpdated !== undefined && (
          <div className="summary-card updated">
            <div className="card-value">{summary.rowsUpdated}</div>
            <div className="card-label">Rows Updated</div>
          </div>
        )}
        {summary?.rowsSkipped !== undefined && (
          <div className="summary-card skipped">
            <div className="card-value">{summary.rowsSkipped}</div>
            <div className="card-label">Rows Skipped</div>
          </div>
        )}
        {summary?.totalErrors !== undefined && (
          <div className="summary-card errors">
            <div className="card-value">{summary.totalErrors}</div>
            <div className="card-label">Errors</div>
          </div>
        )}
      </div>

      {/* Details Section */}
      {details && success && (
        <div className="details-section">
          <h3>Import Details</h3>
          <div className="details-grid">
            {details.affectedMunicipalities && (
              <div className="detail-item">
                <strong>Municipalities:</strong>
                <span>{details.affectedMunicipalities.join(", ")}</span>
              </div>
            )}
            {details.affectedIndicators && (
              <div className="detail-item">
                <strong>Indicators:</strong>
                <span>{details.affectedIndicators.join(", ")}</span>
              </div>
            )}
            {details.periods && (
              <div className="detail-item">
                <strong>Time Periods:</strong>
                <span>{details.periods.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors Table */}
      {errors && errors.length > 0 && (
        <div className="errors-section">
          <div className="errors-header">
            <h3>Validation Errors ({errors.length})</h3>
            <button className="btn-secondary" onClick={downloadErrorReport}>
              Download Error Report
            </button>
          </div>

          <div className="errors-table-container">
            <table className="errors-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("row")} className="sortable">
                    Row {sortColumn === "row" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("column")} className="sortable">
                    Column {sortColumn === "column" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("value")} className="sortable">
                    Value {sortColumn === "value" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Error Message</th>
                </tr>
              </thead>
              <tbody>
                {sortedErrors.map((err, idx) => (
                  <tr key={idx}>
                    <td>{err.row}</td>
                    <td>{err.column}</td>
                    <td className="value-cell">{String(err.value)}</td>
                    <td className="error-cell">{err.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Next Steps Message */}
      {success && (
        <div className="next-steps-message">
          <h3>✓ Data Successfully Imported</h3>
          <p>
            Your crime statistics have been added to the database.
            You can now view the updated data on the map or import additional data.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button className="btn-secondary" onClick={onReset}>
          Import More Data
        </button>
        {success && (
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            View Data in Map →
          </Link>
        )}
        {!success && errors && errors.length > 0 && (
          <button className="btn-primary" onClick={() => window.history.back()}>
            Fix & Re-upload
          </button>
        )}
      </div>
    </div>
  );
}
