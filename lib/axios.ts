import Axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:8000/api/mobile"; // Change to your API URL

const axios = Axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axios.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
