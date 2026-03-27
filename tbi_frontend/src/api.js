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

export default api;
