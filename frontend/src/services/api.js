import axios from "axios";

const API = axios.create({
  baseURL: "https://excel-project-idom.onrender.com",
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
export const forgotPassword = (data) => API.post("/forgot-password", data);
//AdminDashboard Stats/Users
export const statistics = (data) => API.get("/statistics", data);
export const Users = (data) => API.get("/users", data);

//AdminDashboard user Active/Deactive/delete
export const toggleUsers = (userId, data = {}, config = {}) =>
  API.patch(`/users/${userId}`, data, config);
export const deleteuser = (userId, data) =>
  API.delete(`/users/${userId}`, data);
//UserDashboard api (gethistory common for history.js and visualize.js)
export const getHistory = (data) => API.get("/history", data);
export const filePreview = (fileId, data) =>
  API.get(`/${fileId}/preview`, data);
//fileUpload API
export const fileUpload = (data, config) => API.post("/upload", data, config);
//chatgenerator API
export const getFileData = (fileId, data) => API.get(`/${fileId}/data`, data);
export const storeAnalysis = (fileId, data, config) =>
  API.post(`/${fileId}/analysis`, data, config);
