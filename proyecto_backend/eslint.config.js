module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['tests/k6/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      // Estilo de código
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never'],
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'never'], // Mejores prácticas
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-var': 'error',
      // Errores comunes
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-extra-semi': 'error',
      'no-unexpected-multiline': 'error',
      // Consistencia
      'brace-style': ['error', '1tbs', { 'allowSingleLine': true }]
    }
  },
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['tests/k6/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Agregar globals específicos de K6 si es necesario
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'semi': 'off',
      'quotes': 'off',
      'indent': 'off'
    }
  }
];