import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { BASE_URL, THRESHOLDS } from './utils/config.js';

export const options = {
  scenarios: {
    ramp_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 100 }, // ramp up to 100 users
        { duration: '1m', target: 100 }, // stay at 100 users
        { duration: '30s', target: 0 }, // ramp down to 0 users
      ],
    },
    spike: {
      executor: 'ramping-vus',
      startTime: '15m',
      stages: [
        { duration: '10s', target: 300 }, // spike to 300 users
        { duration: '1m', target: 300 }, // stay at 300 users
        { duration: '10s', target: 0 }, // ramp down to 0 users
      ],
    },
    soak: {
      executor: 'constant-vus',
      startTime: '2m',
      vus: 50,
      duration: '3m',
    },
  },
  thresholds: THRESHOLDS,
};


export default function () {
  // Test de registro
  const registerPayload = JSON.stringify({
    username: `testuser_${__VU}_${__ITER}_${Date.now()}`,
    password: 'testpassword',
    email: `test_${__VU}_${__ITER}_${Date.now()}@test.com`,
    bornDate: '2000-01-01'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, params);
  
  check(registerRes, {
    'register status 200': (r) => r.status === 200,
    'register has token': (r) => r.json().token !== undefined,
  });

  // Test de login
  const loginPayload = JSON.stringify({
    username: `testuser_${__VU}_${__ITER}_${Date.now()}`,
    password: 'testpassword'
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
  
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => r.json().token !== undefined,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/auth-test.html': htmlReport(data),
    'reports/auth-summary.json': JSON.stringify(data),
  };
}