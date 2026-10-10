# Monochrome UI and cloud-save rollout

## Approved direction (D-179)

Owner supplies `C:\Users\creat\Downloads\last-light-mono.html` as the new overall
UI reference and requests faithful layout/interaction wiring to real game data.
The standalone file contains sample data and transaction stubs, not authoritative
combat, progression, odds or economy rules. Preserve existing saves, content,
artwork, accessible controls, reduced motion and atomic transactions.

Owner explicitly approves implementing the new stores and profile, with rules
clarified first rather than treating mock products/statistics as live data.

### Material Exchange

- Exactly the six canonical Common elemental materials.
- 80 Prismatica per unit; purchase quantities 1, 5 or 10.
- Identical prices across elements; no bulk discount, selling or daily limit.
- No rarer materials, Rosethorn materials, specialty items or Mechanical
  Components. Preserve existing progression recipes.

### Cosmetic Store

- Free default profile frame.
- Thin Outline, Double Outline and Corner Brackets: 10 Null-Prismatica each.
- CSS-only monochrome designs, permanent ownership and free switching.
- No stat effects or outfit products without delivered artwork.

### Supabase and authentication

Owner requests a new Supabase project for saving/loading and has an account.
Use Free plan and US East. Owner created project `ohtfgwomdfteaxubndww` and
provided its publishable client key. Local Vite configuration is stored in
ignored `.env.local`; `.env.example` contains placeholders only. Authentication,
database schema and synchronization are not yet connected.
Username/password login is approved; registration also collects email for
verification/recovery. Supabase password auth uses email internally: resolve
username privately on the server, never expose an email lookup directory or
put service-role/secret keys in the browser.

Owner chooses mandatory online accounts with server-authoritative progression
and purchases, not local-first cloud backup. Online accounts start fresh; existing
browser saves remain untouched in a separate legacy mode. No import of unverified
browser balances/progress into online accounts.

The server must own combat outcomes/reward eligibility, RNG, progression, summon
results, purchase costs and balances; accepting client-submitted wallets or victory
claims does not meet this requirement. Use authenticated operations, per-user
access controls, transactional updates and retry-safe request IDs. Never report
an online transaction as successful until the server commits it. Client display
and animations are not authoritative. Legacy and online storage must not mix.

Profile persistence/statistics proposal was superseded by the cloud-save request,
not independently approved in full. Do not invent account history, dates,
playtime, draws or activities.
No credentials should be committed. Project URL/publishable client key are
configuration; server secrets belong only in the hosted secret store.

## Still to clarify

- Font replacement: supplied Sora versus existing Georgia contract; prefer
  self-hosted fonts if the owner selects Sora.
- Scope for title, starter selection and immersive battle: no corresponding
  mock screens are present.
- Profile field limits, username rules, statistics tracking and privacy.
- Hosted schema/function deployment access and server combat/session architecture.
- Zustand is an optional state-management suggestion, not a toast library or
  mandatory dependency. Choose only when it solves an actual integration need.

## Status

Reference inspected and initial rules approved. Hosted project supplied and local
client configuration recorded. No replacement UI, authentication, new store
transactions or cloud-save integration implemented yet.
Existing localhost and local saves remain unchanged by this planning/setup step.
