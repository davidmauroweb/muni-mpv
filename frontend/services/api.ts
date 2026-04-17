import axios from "axios";

const api = axios.create({
//baseURL: "http://190.189.33.166:24320/api", // Testing Muni
  baseURL: "http://localhost:8000/api", // desarrollo local
  headers: {
    "Content-Type": "application/json"
  }
});
// envío token e intercepto sesion caducada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('muni_session');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
