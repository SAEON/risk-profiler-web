// src/pages/ImportPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import ImportWizard from "../components/import/ImportWizard";
import "../styles/ImportPage.css";

/**
 * ImportPage - Wrapper page for the import wizard
 * Accessible at /import route
 */
export default function ImportPage() {
  return (
    <div className="import-page">
      <div className="import-page-header">
        <Link to="/" className="back-to-home">
          ← Back to Map
        </Link>
      </div>
      <ImportWizard />
    </div>
  );
}
