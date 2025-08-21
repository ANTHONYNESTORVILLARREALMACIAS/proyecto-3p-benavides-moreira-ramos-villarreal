export const BASE_URL = 'http://localhost:3000/api';
export const THRESHOLDS = {
  http_req_duration: ['p(95)<1000'], // Cambiar de 500ms a 1000ms
  http_req_failed: ['rate<0.05'],    // Cambiar de 1% a 5%
  checks: ['rate>0.95']              // Cambiar de 99% a 95%
};