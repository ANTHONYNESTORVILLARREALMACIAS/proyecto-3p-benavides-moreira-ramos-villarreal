const { exec } = require('child_process');
const fs = require('fs');

const tests = [
  'auth',
  'subjects',
  'variants',
  'resources',
  'subscriptions',
  'evaluations',
  'userVariants'
];

async function runTests() {
  console.log('Running performance tests...');

  // Crear directorio de reports si no existe
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports');
  }

  let allPassed = true;
  const results = {};

  for (const test of tests) {
    try {
      console.log(`Running ${test} test...`);

      await new Promise((resolve, _reject) => {
        exec(`k6 run tests/k6/${test}.test.js --out json=reports/${test}-results.json`,
          (error, _stdout, _stderr) => {
            if (error) {
              console.error(`Error in ${test}:`, error.message);
              results[test] = { success: false, error: error.message };
              allPassed = false;
            } else {
              console.log(`${test} completed`);
              results[test] = { success: true };
            }
            resolve();
          }
        );
      });

      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Failed to run ${test}:`, error);
      results[test] = { success: false, error: error.message };
      allPassed = false;
    }
  }

  // Guardar resumen de resultados
  fs.writeFileSync('reports/performance-summary.json', JSON.stringify(results, null, 2));

  console.log('\n=== PERFORMANCE TEST SUMMARY ===');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result.success ? 'PASS' : 'FAIL'}${result.error ? ` - ${result.error}` : ''}`);
  });

  if (!allPassed) {
    console.log('\n⚠️  Some tests failed thresholds. Check individual reports for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All performance tests completed successfully!');
  }
}

runTests().catch(console.error);