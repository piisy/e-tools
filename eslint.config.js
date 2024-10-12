// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
      'pnpm-lock.yaml',
    ],
  },
  {
    rules: {
      // overrides
      'ts/ban-ts-comment': 'off',
    },
  },
)
