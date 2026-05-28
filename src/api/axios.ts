import axios from 'axios';

const api = axios.create({
  // Apunta directamente al puerto de tu backend en la VM
  baseURL: 'http://www.dali.com.co:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;