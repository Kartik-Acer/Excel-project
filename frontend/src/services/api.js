import axios from "axios";

const API = axios.create({
  baseURL: "https://excel-project-idom.onrender.com",
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
