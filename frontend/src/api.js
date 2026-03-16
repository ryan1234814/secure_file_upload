/**
 * api.js
 * ------
 * Centralised Axios instance and API helper functions for
 * communicating with the FastAPI backend.
 */

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

/**
 * Upload a file to the backend.
 * @param {File} file - The file object from a file input.
 * @returns {Promise} Axios response.
 */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Fetch the list of all uploaded files.
 * @returns {Promise} Axios response containing file list.
 */
export const getFiles = () => API.get("/files");

/**
 * Verify the integrity of a specific file.
 * @param {string} filename - Name of the file to verify.
 * @returns {Promise} Axios response with integrity result.
 */
export const verifyFile = (filename) => API.get(`/verify/${filename}`);

/**
 * Tamper with a file (security demonstration).
 * @param {string} filename - Name of the file to tamper.
 * @returns {Promise} Axios response.
 */
export const tamperFile = (filename) => API.post(`/tamper/${filename}`);

export default API;
