// src/lib/api.js
import axios from 'axios';

// 1) Base URL publique (visible côté client)
const baseURL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// 2) Instance Axios réutilisable
export const api = axios.create({
  baseURL,
  withCredentials: true, // <- cookies envoyés automatiquement si le backend en met
  timeout: 10000
});

/**
 * -------------------------------------------
 * INTERCEPTEUR DE REQUÊTE
 * -------------------------------------------
 * Signature: (config) => config
 * - S'exécute AVANT que la requête parte sur le réseau
 * - 'config' contient: url, method, headers, data, params, etc.
 */
api.interceptors.request.use((config) => {
  // 3) S'assurer que l'objet headers existe
  config.headers = config.headers || {};

  // 4) Poser un Content-Type JSON *uniquement* si on envoie un objet
  //    et qu'on n'envoie pas déjà un FormData
  const isFormData = typeof FormData !== 'undefined' && (config.data instanceof FormData);
  if (config.data && !isFormData && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // 5) Ici PAS de Bearer: tu n'as pas de token => rien à ajouter.
  //    Les cookies (si withCredentials=true) sont gérés par le navigateur.

  return config; // IMPORTANT: on renvoie la config (sinon la requête est bloquée)
});

/**
 * -------------------------------------------
 * INTERCEPTEUR DE RÉPONSE
 * -------------------------------------------
 * Signature (succès):    (response) => response
 * Signature (erreur):    (error)    => Promise.reject(error)
 * - S'exécute APRÈS réception de la réponse HTTP
 * - Permet de standardiser ce que renvoie l'API à l'app
 */
api.interceptors.response.use(
  // 6) Cas succès -> on renvoie directement les 'data' (payload utile)
  (res) => res.data,

  // 7) Cas erreur -> on normalise l'erreur
  (err) => {
    const r = err.response; // peut être undefined si coupure réseau/CORS
    const message =
      r?.data?.message || r?.data?.error || err.message || 'Network error';

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[API]', r?.status, message, r?.data);
    }

    // 8) On rejette avec un objet propre et prévisible
    return Promise.reject({
      message,            // message lisible
      status: r?.status,  // code HTTP (ex: 400, 401, 500) si dispo
      data: r?.data       // payload d'erreur brut du backend si utile
    });
  }
);

// 9) Helpers simples (facultatifs)
const get = (url, config) => api.get(url, config);
const post = (url, data, config) => api.post(url, data, config);
const put = (url, data, config) => api.put(url, data, config);
const del = (url, config) => api.delete(url, config);

export default { get, post, put, delete: del, raw: api };
