# `src/features/`

Feature-scoped code. One folder per vertical (e.g. `stylist-onboarding/`,
`reports-admin/`). Each feature owns its own components, hooks, services,
and tests — colocated.

Promote shared pieces to `src/components/`, `src/hooks/`, or `src/services/`
only when they're used by ≥2 features.

## Suggested layout

```
features/
├── stylist-onboarding/
│   ├── components/
│   ├── hooks/
│   ├── server/         server actions
│   ├── schema.ts       Zod schemas
│   └── index.ts        public exports
└── reports-admin/
    └── ...
```
