// src/components/import/CategorySelector.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../config/importCategories";

/**
 * CategorySelector - Displays category tiles for user selection
 * Navigates to /import/{categoryId} when a tile is clicked
 */
export default function CategorySelector() {
  const navigate = useNavigate();
  const categories = getAllCategories();

  const handleCategorySelect = (categoryId) => {
    navigate(`/import/${categoryId}`);
  };

  // Icon component based on category icon type
  const CategoryIcon = ({ icon, color }) => {
    const iconMap = {
      'shield': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      'chart-bar': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      ),
    };

    return (
      <div className="category-icon" style={{ color }}>
        {iconMap[icon] || iconMap['chart-bar']}
      </div>
    );
  };

  return (
    <div className="category-selector">
      <h2>Select Data Category</h2>
      <p className="instructions">
        Choose the type of data you want to import. Each category has its own
        Excel template format and validation rules.
      </p>

      <div className="category-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-tile"
            data-category={category.id}
            onClick={() => handleCategorySelect(category.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCategorySelect(category.id);
              }
            }}
          >
            <CategoryIcon icon={category.icon} color={category.color} />
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
            <div className="category-arrow" style={{ color: category.color }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
