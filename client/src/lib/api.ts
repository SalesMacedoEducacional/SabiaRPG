import axios from 'axios';

// Configura a instância do axios com as opções necessárias para preservar sessões
const api = axios.create({
  baseURL: '/',
  withCredentials: true, // Importante para enviar cookies de sessão
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;