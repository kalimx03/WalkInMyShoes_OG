/**
 * main.jsx - Clean entry point
 * React 18 + Vite + A-Frame + Amplify
 */

import React from "react";
import ReactDOM from "react-dom/client";

/* A-Frame must load before any component using <a-scene> */
import "aframe";
import "aframe-extras";

/* AWS Amplify */
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

/* Global Styles */
import "./styles/main.css";

/* App */
import App from "./App";

/* Configure Amplify (safe even if not fully used yet) */
try {
  Amplify.configure(awsExports);
  console.log("[WIMS] Amplify configured");
} catch (err) {
  console.warn("[WIMS] Amplify config skipped:", err);
}

/* Mount React */
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found in index.html");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("[WIMS] App mounted successfully");