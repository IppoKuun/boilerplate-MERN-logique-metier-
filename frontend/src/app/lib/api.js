// lib/api.js
import axios from "axios";

const env = (process.env.NODE_ENV || "").toLowerCase();
const isDev = env === "development" || env === "developpement";

const explicitBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const devBaseUrl = process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:4000";
const prodBaseUrl = process.env.NEXT_PUBLIC_API_URL_PROD || devBaseUrl;
const baseURL = explicitBaseUrl || (isDev ? devBaseUrl : prodBaseUrl);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

console.log("[axios] baseURL =", api.defaults.baseURL);

// Interceptor Request
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const isFormData = config.data instanceof FormData;
  if (config.data && !isFormData && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Interceptor Response
api.interceptors.response.use(
  (res) => res.data,

  (err) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Erreur réseau";

    const status = err.response?.status;
    const data = err.response?.data;

    // En dev : log détaillé
    if (isDev) {
      console.error("[AXIOS ERROR]", {
        status,
        msg,
        data,
        url: err.config?.url,
        method: err.config?.method,
      });
    }

    return Promise.reject({ msg, status, data });
  }
);

// Méthodes utilitaires
const get = (url, config) => api.get(url, config);
const post = (url, data, config) => api.post(url, data, config);
const del = (url, config) => api.delete(url, config);
const patch = (url, data, config) => api.patch(url, data, config);

export default {
  get,
  post,
  delete: del,
  patch,
  raw: api,
};