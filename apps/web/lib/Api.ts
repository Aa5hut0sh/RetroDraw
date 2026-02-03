"use client"
import axios from "axios";
export const getBaseUrl = () => {
  
  if (typeof window !== "undefined") {
    return "/api";
  }

  return "http://127.0.0.1:3001/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
    }

    return Promise.reject(error);
  }
);

export default api;