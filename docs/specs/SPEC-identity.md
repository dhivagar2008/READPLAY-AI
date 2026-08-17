# SPEC-identity

## Objective

Google sign-in (popup flow, client-side only) so the parent can access the Insights page; guest access stays fully functional when Google isn't configured. Session persisted in localStorage.

## Key Decisions

- Reuse the proven pattern from `playai/src/lib/auth.js` (GIS popup, `readplayai:session` key) but simplify: no route-gating for children; only `/insights` requires a signed-in parent.
- Client ID via `VITE_GOOGLE_CLIENT_ID`; absent → guest mode everywhere (insights page shows "sign in with Google to view insights").

## Boundaries

- No backend; tokens never logged; session JSON has no child data.

## Success Criteria

- Sign in/out works; session survives reload; insights route accessible only when signed in; guest mode shows explanatory message.
