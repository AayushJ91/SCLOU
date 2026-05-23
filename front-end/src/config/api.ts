/**
 * SCLOU API Configuration
 * Centralized API settings and endpoints
 */

// API Base URL - uses environment variable or defaults to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  // Meta
  root: "/",

  // Sensor Data
  zones: "/zones",

  // Structural
  structural: "/structural",

  // Energy
  energy: "/energy",

  // Alerts
  alerts: "/alerts",

  // Control
  simulate: "/simulate",
} as const;

// Full URLs
export const API_FULL_URLS = {
  root: `${API_BASE_URL}${API_ENDPOINTS.root}`,
  zones: `${API_BASE_URL}${API_ENDPOINTS.zones}`,
  structural: `${API_BASE_URL}${API_ENDPOINTS.structural}`,
  energy: `${API_BASE_URL}${API_ENDPOINTS.energy}`,
  alerts: `${API_BASE_URL}${API_ENDPOINTS.alerts}`,
  simulate: `${API_BASE_URL}${API_ENDPOINTS.simulate}`,
} as const;

// Polling interval (milliseconds)
export const POLLING_INTERVAL = 3000;

// Request timeouts
export const REQUEST_TIMEOUT = 10000;

// Default query parameters
export const DEFAULT_QUERY_PARAMS = {
  alertsLimit: 50,
} as const;
