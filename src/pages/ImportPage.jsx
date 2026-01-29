// src/pages/ImportPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import CategorySelector from "../components/import/CategorySelector";
import "../styles/ImportPage.css";

/**
 * ImportPage - Category selection landing page
 * Accessible at /import route
 * Shows tiles for available import categories
 */
export default function ImportPage() {
  return (
    <div className="import-page">
      <div className="import-page-header">
        <Link to="/" className="back-to-home">
          &larr; Back to Map
        </Link>
      </div>
      <div className="import-wizard">
        <header className="wizard-header">
          <h1>Import Data</h1>
          <p className="subtitle">Select the type of data you want to import</p>
        </header>
        <main className="wizard-content">
          <CategorySelector />
        </main>
      </div>
    </div>
  );
}
