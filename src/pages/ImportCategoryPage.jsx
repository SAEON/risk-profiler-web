// src/pages/ImportCategoryPage.jsx
import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import ImportWizard from "../components/import/ImportWizard";
import { getCategoryConfig } from "../config/importCategories";
import "../styles/ImportPage.css";

/**
 * ImportCategoryPage - Wrapper page for category-specific import wizard
 * Accessible at /import/:category route
 * Extracts category from URL params and passes config to ImportWizard
 */
export default function ImportCategoryPage() {
  const { category: categoryId } = useParams();
  const categoryConfig = getCategoryConfig(categoryId);

  // Redirect to category selection if invalid category
  if (!categoryConfig) {
    return <Navigate to="/import" replace />;
  }

  return (
    <div className="import-page">
      <div className="import-page-header">
        <Link to="/import" className="back-to-home">
          &larr; Back to Category Selection
        </Link>
      </div>
      <ImportWizard category={categoryConfig} />
    </div>
  );
}
