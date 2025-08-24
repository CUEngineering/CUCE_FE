/* eslint-disable prettier/prettier */
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// import vueI18n from "@intlify/eslint-plugin-vue-i18n";
import withNuxt from './.nuxt/eslint.config.mjs';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default withNuxt([
    {
        ignores: [
            '.nitro/**',
            '.nuxt/**',
            '.output/**',
            '.vscode/**',
            'dist/**',
            'node_modules/**',
            'coverage/**',
            '**/*.svg',
        ],
    },
    // ...vueI18n.configs['flat/recommended'],
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...eslintConfigPrettier.rules,
            ...eslintPluginPrettierRecommended.rules,
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                    singleQuote: true,
                    singleAttributePerLine: true,
                    trailingComma: 'all',
                    tabWidth: 2,
                    useTabs: false,
                    bracketSpacing: true,
                    jsxBracketSameLine: false,
                    semi: true,
                    printWidth: 70,
                },
            ],
            'no-console': 'warn',
            'no-empty': 'warn',
            'vue/multi-word-component-names': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/no-reserved-props': 'off',
            'vue/v-on-event-hyphenation': 'off',
        },
        settings: {
            'vue-i18n': {
                localeDir: './localization/*.json',
                messageSyntaxVersion: '^9.0.0',
            },
        },
    },
])
    .prepend
// ...Prepend some flat configs in front
    ()
// Override some rules in a specific config, based on their name
    .override('nuxt/typescript/rules', {
        rules: {
            // ...Override rules, for example:
            '@typescript-eslint/ban-types': 'off',
        },
    })
    .override('nuxt/stylistic', {
        rules: {
            '@stylistic/operator-linebreak': 'off',
            '@stylistic/brace-style': 'off',
            '@stylistic/indent': 'off',
            '@stylistic/quote-props': 'off',
            '@stylistic/arrow-parens': 'off',
            '@stylistic/indent-binary-ops': 'off',
        },
    });
