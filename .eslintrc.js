module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:vue/recommended',
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'off',
    'semi': 'off',
    'space-before-function-paren': 0,
    'comma-dangle': 'off',
    'no-self-compare': 'off',
    'require-await': 'off',
    'no-self-compare': 'off',
    'import/order': 'off'
  }
}
