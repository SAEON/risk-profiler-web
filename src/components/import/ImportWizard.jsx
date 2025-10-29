// src/components/import/ImportWizard.jsx
import React, { useState } from "react";
import ThemeSelector from "./ThemeSelector";
import TemplateDownload from "./TemplateDownload";
import FileUploader from "./FileUploader";
import ImportResults from "./ImportResults";

/**
 * ImportWizard - Main orchestrator for the 4-step import process
 * Step 1: Select themes
 * Step 2: Download template
 * Step 3: Upload filled template
 * Step 4: View results
 */
export default function ImportWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // Step 1 → Step 2
  const handleThemesSelected = (themes) => {
    setSelectedThemes(themes);
    setCurrentStep(2);
  };

  // Step 2 → Step 3
  const handleTemplateDownloaded = () => {
    setCurrentStep(3);
  };

  // Step 3 → Step 4
  const handleUploadComplete = (result) => {
    setImportResult(result);
    setCurrentStep(4);
  };

  // Reset to Step 1
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedThemes([]);
    setImportResult(null);
  };

  // Stepper component
  const Stepper = () => {
    const steps = [
      { num: 1, label: "Select Themes" },
      { num: 2, label: "Download Template" },
      { num: 3, label: "Upload Data" },
      { num: 4, label: "Results" },
    ];

    return (
      <div className="stepper">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className={`step ${currentStep === step.num ? "active" : ""} ${currentStep > step.num ? "completed" : ""}`}>
              <div className="step-number">{currentStep > step.num ? "✓" : step.num}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {idx < steps.length - 1 && <div className="step-connector" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="import-wizard">
      <header className="wizard-header">
        <h1>Import Crime Statistics</h1>
        <p className="subtitle">Upload crime data using Excel templates</p>
        <Stepper />
      </header>

      <main className="wizard-content">
        {currentStep === 1 && <ThemeSelector onThemesSelected={handleThemesSelected} />}

        {currentStep === 2 && (
          <TemplateDownload
            selectedThemes={selectedThemes}
            onTemplateDownloaded={handleTemplateDownloaded}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <FileUploader
            onUploadComplete={handleUploadComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ImportResults
            result={importResult}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
