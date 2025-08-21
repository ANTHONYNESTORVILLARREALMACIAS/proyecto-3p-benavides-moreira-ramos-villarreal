// eslint.config.js
import js from '@eslint/js';
import angular from '@angular-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

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
            sourceType: 'module',
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            '@angular-eslint': angular
        },
        rules: {
            // Reglas básicas
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            
            // Reglas de TypeScript (más permisivas)
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            
            // Reglas de Angular
            '@angular-eslint/directive-selector': ['error', {
                type: 'attribute',
                prefix: 'app',
                style: 'camelCase'
            }],
            '@angular-eslint/component-selector': ['error', {
                type: 'element',
                prefix: 'app',
                style: 'kebab-case'
            }]
        }
    },
    
    // Configuración para templates HTML de Angular
    {
        files: ['**/*.html'],
        plugins: {
            '@angular-eslint/template': angular.template
        },
        rules: {
            // Reglas más permisivas para templates
            '@angular-eslint/template/click-events-have-key-events': 'warn',
            '@angular-eslint/template/interactive-supports-focus': 'warn'
        }
    }
];