import axios from 'axios';
import { log } from './axios';

const baseURL = import.meta.env.VITE_STREAM_BACKEND_URL || '/stream-api';

const streamBackendClient = axios.create({
  baseURL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000'),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

streamBackendClient.interceptors.request.use((config) => {
  const url = `${config.baseURL}${config.url}`;
  log('debug', `[streamBackendClient] Request: ${config.method?.toUpperCase()} ${url}`);
  return config;
});

streamBackendClient.interceptors.response.use(
  (response) => {
    log('debug', `[streamBackendClient] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    log('error', `[streamBackendClient] Error: ${error.message}`);
    return Promise.reject(error);
  },
);

export default streamBackendClient;
