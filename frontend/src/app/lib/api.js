import axios from "axios";

const BaseURL = process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL_PROD

const api = axios.create({
  baseURL: BaseURL,
  withCredentials: true,
  timeout: 10000
})


api.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  const haveFormData = (config.data instanceof FormData)
  if (config.data && !haveFormData && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = "application/json";
  }

  return config
})

api.interceptors.response.use((res) => {
  (res) => res.data,
  (err) => {
    const msg =err.response?.data?.message || 
                   err.response?.data?.error || 
                   err.message || 
                   "Erreur axios response";

    if (NEXT_PUBLIC_process.env.NODE_ENV === "developement"){
      return console.log(" AXIOS ERREUR RESPONSE API", r?.status, message, r?.data)
    }
        return Promise.reject({
          msg,
          status: res?.status,
          data: res?.data        
      })
  }
})


const get = (url, config) => api.get(url, config);
const post = (url, data, config) => api.post(url, data, config);
const del = (url, config) => api.delete(url, config);
const patch = (url, data, config) => api.patch(url, data, config);

export default {get, post, delete: del, patch, raw:api}
