import RequireActual2AsyncImport from 'external/modules/ast/rules/require-actual-2-async-import'

export const Jest2VitestPreset = {
  name: 'jest-2-vitest',
  description: 'Jest to Vitest',
  visitors: [
    new RequireActual2AsyncImport()
  ]
};