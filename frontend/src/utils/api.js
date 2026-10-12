import axios from "axios";

const api = axios.create({
  baseURL:  https://spfashion1.onrender.com,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sp-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
