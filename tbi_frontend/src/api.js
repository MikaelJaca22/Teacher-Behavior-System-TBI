import axios from "axios";

const urlParams = new URLSearchParams(window.location.search);
const localApi = urlParams.get("api");

const api = axios.create({
  baseURL: localApi || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
