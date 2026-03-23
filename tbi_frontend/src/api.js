// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000, https://unmarkable-dorthea-interspatially.ngrok-free.dev", 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;

import axios from "axios";


const urlParams = new URLSearchParams(window.location.search);
const localApi = urlParams.get("api");


const api = axios.create({
  baseURL: localApi ||  "https://unmarkable-dorthea-interspatially.ngrok-free.dev", // local testing
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

export default api;
