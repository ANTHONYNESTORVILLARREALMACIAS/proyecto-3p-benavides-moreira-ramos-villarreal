import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { BASE_URL, THRESHOLDS } from './utils/config.js';
import { setupAuth } from './utils/auth.js';

export const options = {
  scenarios: {
    ramp_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '5m', target: 100 }, // ramp up to 100 users
        { duration: '10m', target: 100 }, // stay at 100 users
        { duration: '5m', target: 0 }, // ramp down to 0 users
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
      startTime: '25m',
      vus: 50,
      duration: '30m',
    },
  },
  thresholds: THRESHOLDS,
};


export function setup() {
  return setupAuth();
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.authToken}`,
    },
  };

  // Obtener todas las asignaturas
  const getRes = http.get(`${BASE_URL}/subjects`, params);
  
  check(getRes, {
    'get subjects status 200': (r) => r.status === 200,
    'subjects returned': (r) => r.json().data.length >= 0,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'reports/subjects-test.html': htmlReport(data),
    'reports/subjects-summary.json': JSON.stringify(data),
  };
}