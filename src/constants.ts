/**
 * Barrel re-export — the canonical constants live in `src/constants/index.ts`.
 * This file exists only so that `@/constants` resolves correctly under both
 * file-first and directory-first module resolution strategies.
 */
export * from './constants/index';
