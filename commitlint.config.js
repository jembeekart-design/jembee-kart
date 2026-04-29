/* FILE: commitlint.config.js */

module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    /* =========================
       TYPE RULES
    ========================= */
    'type-enum': [
      2,
      'always',
      [
        'feat',        // new feature
        'fix',         // bug fix
        'docs',        // documentation
        'style',       // UI / CSS (glass morphism)
        'refactor',    // code improvement
        'perf',        // performance
        'test',        // testing
        'build',       // build system
        'ci',          // CI/CD
        'chore',       // misc
        'revert'       // rollback
      ]
    ],

    /* =========================
       SCOPE (PROJECT MODULES)
    ========================= */
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'theme',
        'ui',
        'admin',
        'seller',
        'customer',
        'payment',
        'firebase',
        'qikink',
        'api',
        'store',
        'hooks',
        'security',
        'config'
      ]
    ],

    /* =========================
       SUBJECT RULES
    ========================= */
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100]
  }
};