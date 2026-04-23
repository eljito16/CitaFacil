import axios from "axios";

const API_URL = "http://192.168.1.8:3000/api";  //https://citafacil-backend.onrender.com/api   // http://192.168.1.8:3000/api

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common["Authorization"];
};