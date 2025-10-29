// src/pages/ImportPage.jsx
import React from "react";
import ImportWizard from "../components/import/ImportWizard";
import "../styles/ImportPage.css";

/**
 * ImportPage - Wrapper page for the import wizard
 * Accessible at /import route
 */
export default function ImportPage() {
  return (
    <div className="import-page">
      <ImportWizard />
    </div>
  );
}
