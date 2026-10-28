# Aniverse — Cinematic Premium redesign notes

## Design direction
- Dark cinematic canvas with subtle indigo/violet ambient lighting.
- Violet-to-indigo accent system for primary actions, focus states, active controls, and branded highlights.
- Consistent surface, border, muted text, and focus tokens in `app/globals.css`.
- Responsive hero sizing and compact mobile search shortcut.
- Reduced-motion support, improved keyboard focus visibility, and more restrained global scrollbar styling.

## Scope of this pass
- Updated the shared global design tokens and interaction states.
- Recolored existing accent classes across public, account, player, and admin routes without changing data contracts or API behavior.
- Refined hero responsive spacing, CTA styling, and carousel controls.
- Added a mobile search shortcut in the navbar.
- Kept existing authentication, Prisma queries, upload handlers, player behavior, and admin workflows intact.

## Validation
- `npm ci` could not complete in the execution environment because the npm registry was unreachable (`EAI_AGAIN registry.npmjs.org`). As a result, dependencies were not installed and a production `next build` could not be run here. Run `npm ci` and `npm run build` in an environment with registry access before deploying.

## Homepage redesign pass (2026-10-27)
- Reworked the homepage introduction into a more editorial, cinematic layout with violet-to-electric-blue lighting and clear content hierarchy.
- Added horizontally scrollable quick-genre links based on genres already present in the database; links use the existing search route and do not introduce new API contracts.
- Refined anime shelves with responsive spacing, accessible carousel controls, a visible count, curated section labels, and scroll distance based on the shelf width.
- Redesigned poster cards with restrained hover lift, violet/blue lighting, clearer status/rating badges, lazy loading for non-priority artwork, and keyboard focus styles.
- Refined hero sizing, gradients, CTA styling, metadata contrast, and pagination colors while retaining trailer playback, welcome flow, featured ordering, and existing routes.
- Added a safe hero fallback for catalogues where no anime has a dedicated banner or cover image.
- Kept Prisma queries, watch history, authentication, API routes, player, and admin behavior unchanged.

## Validation status for this pass
- `npx tsc --noEmit`: could not complete; local dependency installation is incomplete and TypeScript reported missing type definition packages (`bcryptjs`, `estree`, `json-schema`, `json5`, `node`, `pg`, `react`, `react-dom`).
- `npm run build`: could not start; shell reported `next: not found` because the local Next.js dependency is not installed correctly.
- `npm ci`: timed out in this environment. Re-run `npm ci`, then `npx tsc --noEmit` and `npm run build` on a machine with npm registry access before deploying.
