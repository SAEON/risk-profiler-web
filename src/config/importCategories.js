// src/config/importCategories.js

/**
 * Configuration for import data categories
 * Each category defines its endpoints, labels, and display properties
 */
export const IMPORT_CATEGORIES = {
  'crime-stats': {
    id: 'crime-stats',
    name: 'Crime Statistics',
    description: 'Import crime data from SAPS crime statistics reports',
    icon: 'shield',
    color: '#ef4444',
    endpoints: {
      themes: '/import/crime-stats/themes',
      template: '/import/crime-stats/template',
      upload: '/import/crime-stats',
    },
    labels: {
      pageTitle: 'Import Crime Statistics',
      pageSubtitle: 'Upload crime statistics data using Excel templates',
      themeSelectTitle: 'Select Crime Themes',
      themeSelectDescription: 'Choose one or more crime themes to download an Excel template for data import.',
      templateFilenamePrefix: 'crime-stats-template',
      uploadInstructions: 'Upload the Excel file you filled with crime statistics data.',
    },
  },
  'socio-economic': {
    id: 'socio-economic',
    name: 'Socio-Economic Indicators',
    description: 'Import socio-economic data such as demographics, education, and employment metrics',
    icon: 'chart-bar',
    color: '#3b82f6',
    endpoints: {
      themes: '/import/socio-economic/themes',
      template: '/import/socio-economic/template',
      upload: '/import/socio-economic',
    },
    labels: {
      pageTitle: 'Import Socio-Economic Indicators',
      pageSubtitle: 'Upload socio-economic data using Excel templates',
      themeSelectTitle: 'Select Indicator Themes',
      themeSelectDescription: 'Choose one or more indicator themes to download an Excel template for data import.',
      templateFilenamePrefix: 'socio-economic-template',
      uploadInstructions: 'Upload the Excel file you filled with socio-economic indicator data.',
    },
  },
};

/**
 * Get configuration for a specific category
 * @param {string} categoryId - The category ID (e.g., 'crime-stats', 'socio-economic')
 * @returns {object|null} The category configuration or null if not found
 */
export const getCategoryConfig = (categoryId) => {
  return IMPORT_CATEGORIES[categoryId] || null;
};

/**
 * Get all available categories as an array
 * @returns {array} Array of category configuration objects
 */
export const getAllCategories = () => Object.values(IMPORT_CATEGORIES);

export default IMPORT_CATEGORIES;
