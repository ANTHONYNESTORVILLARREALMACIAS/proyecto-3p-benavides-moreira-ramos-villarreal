import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

export function setupAuth() {
  // Crear usuario de prueba para las pruebas
  const registerPayload = JSON.stringify({
    username: `loadtest_${Date.now()}`,
    password: 'testpassword',
    email: `loadtest_${Date.now()}@test.com`,
    bornDate: '2000-01-01'
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, registerParams);
  
  if (!check(registerRes, { 'register success': (r) => r.status === 200 })) {
    throw new Error('Failed to setup test user');
  }

  const loginPayload = JSON.stringify({
    username: registerRes.json().user.username,
    password: 'testpassword'
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, registerParams);
  
  if (!check(loginRes, { 'login success': (r) => r.status === 200 })) {
    throw new Error('Failed to login test user');
  }

  return {
    authToken: loginRes.json().token,
    userId: loginRes.json().user.idUsuario,
    username: loginRes.json().user.username
  };
}