// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import App from "./app/App";
import ImportPage from "./pages/ImportPage";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.PUBLIC_URL || ""}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/import" element={<ImportPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


reportWebVitals();
