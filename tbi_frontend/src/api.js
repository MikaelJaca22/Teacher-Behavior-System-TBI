import axios from "axios";

const urlParams = new URLSearchParams(window.location.search);
const localApi = urlParams.get("api");

const api = axios.create({
  baseURL: localApi || "https://dedicatedly-undecided-sloane.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

export const getCurrentPeriod = () => api.get('/evaluation-periods/current/');
export const getPeriods = () => api.get('/evaluation-periods/');
export const getTeachers = (periodId) => {
  const params = periodId ? `/?period_id=${periodId}` : '/';
  return api.get(`/teachers/${params}`);
};

export default api;
