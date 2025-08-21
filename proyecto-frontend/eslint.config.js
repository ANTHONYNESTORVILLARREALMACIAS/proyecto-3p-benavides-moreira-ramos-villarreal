// eslint.config.js
export default [
    // Configuración para archivos JavaScript
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single']
        }
    },
    
    // Configuración para archivos TypeScript
    {
        files: ['**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            // Hacer estas reglas más estrictas si quieres que fallen
            '@typescript-eslint/no-explicit-any': 'error', // Cambiado de 'warn' a 'error'
        }
    },
    
    // Configuración para templates HTML
    {
        files: ['**/*.html'],
        rules: {
            // Estas reglas también pueden ser 'error' si quieres que fallen
        }
    }
];