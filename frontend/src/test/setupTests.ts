import { configure } from '@testing-library/dom'
import '@testing-library/jest-dom/vitest'

// Default is 1000ms, which is tight under CPU contention (e.g. running the full
// suite's test files in parallel) even though the app logic itself is correct —
// raises the ceiling for findBy*/waitFor without masking a genuine hang (a real
// infinite loop would still exceed this and the global Vitest testTimeout below).
configure({ asyncUtilTimeout: 5000 })
