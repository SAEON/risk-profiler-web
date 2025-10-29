// src/components/import/FileUploader.jsx
import React, { useState } from "react";
import api from "../../lib/api";

/**
 * Step 3: File Upload
 * Allows user to upload filled Excel template
 * Props:
 *  - onUploadComplete: (result) => void - Callback with upload result
 *  - onBack: () => void - Callback to go back to template download
 */
export default function FileUploader({ onUploadComplete, onBack }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  // Validate file type
  const isValidFile = (file) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    const validExtensions = [".xlsx", ".xls"];

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  };

  // Handle file selection
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (!isValidFile(selectedFile)) {
      setError("Invalid file type. Please upload an Excel file (.xlsx or .xls).");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const result = await api.uploadCrimeStats(file);
      onUploadComplete(result);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload file. Please try again.");
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="file-uploader">
      <h2>Upload Filled Template</h2>
      <p className="instructions">
        Upload the Excel file you filled with crime statistics data.
      </p>

      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="drop-icon">📄</div>
            <p>Drag and drop your Excel file here</p>
            <p className="or-text">or</p>
            <label htmlFor="file-input" className="btn-file-picker">
              Choose File
            </label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              style={{ display: "none" }}
            />
            <p className="hint">Accepts .xlsx and .xls files</p>
          </>
        ) : (
          <div className="file-info">
            <div className="file-icon">✓</div>
            <div className="file-details">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{formatFileSize(file.size)}</p>
            </div>
            <button
              className="btn-remove"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <p>Uploading and processing data...</p>
          <div className="progress-bar">
            <div className="progress-indicator"></div>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn-secondary" onClick={onBack} disabled={uploading}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload & Import"}
        </button>
      </div>
    </div>
  );
}
