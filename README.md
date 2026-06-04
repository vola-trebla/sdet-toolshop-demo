# Toolshop Test Automation — Demo Framework

Playwright + TypeScript framework demonstrating a clean, scalable test architecture.
Targets the public [Toolshop](https://practicesoftwaretesting.com) app (Web UI + REST API).

> This is a **portfolio/demo** repo: it shows how I design and structure tests.
> It does not reimplement any product.

## What it demonstrates

- **Assertion-free Page Objects** — POMs expose actions + `readonly` locators; asserts live in specs (web-first, auto-retry).
- **Dependency injection via fixtures** — no `new` in spec files.
- **Component composition (COM)** — shared widgets like `HeaderNav` are components composed into the pages that use them, not pages or root fixtures.
- **Service layer with runtime contracts** — backend calls isolated in `ToolshopApi`; every response is validated against a zod schema (`src/services/schemas.ts`) that also derives the TypeScript types. Raw `*Response` methods for negative paths, assertive helpers for happy paths.
- **Dynamic test data** — `UserBuilder` + faker, unique per run (parallel-safe), immutable output.
- **Auth reuse** — a `setup` project signs in once and persists `storageState`; the `web-auth` project consumes it via project-level `use.storageState`, so authenticated tests start logged in with no per-test login.
- **Resilient locators** — `data-test` / role-based, no brittle CSS chains.
- **Allure reporting** — a `@step` decorator turns Page Object / service actions into report steps automatically. Richer metadata (severity, TMS links) is available via `allure-js-commons` where a case warrants it. The same output feeds Allure TestOps.
- **Fail-fast config** — env validated with zod; CI requires all vars, local falls back to the public demo.

See [`docs/architecture-decisions.md`](docs/architecture-decisions.md) for the reasoning behind each choice.

## Layout

```
src/
  components/ HeaderNav                              (reusable UI, composed into pages)
  pages/      LoginPage, ProductsPage,               (UI interaction boundaries)
              ProductDetailPage, AccountPage
  services/   ToolshopApi, schemas                   (backend communication + zod contracts)
  data/       UserBuilder                            (dynamic test data)
  constants/  routes, endpoints                      (web paths + API endpoints)
  fixtures/   app.fixture                            (dependency injection)
  utils/      config, step                           (env config, @step decorator)
tests/
  auth.setup.ts                                      (logs in once, saves session)
  web/        login, products, account               (E2E)
  api/        auth, products, negative               (REST + negative paths)
```

Playwright projects: `setup` → `web-public` (clean context) / `web-auth`
(consumes `storageState`) / `api` (no browser).

## Run

```bash
npm install
npx playwright install chromium
cp .env.example .env

npm test               # everything
npm run test:web       # web only
npm run test:web:public # public web (no login)
npm run test:web:auth   # authenticated web
npm run test:api       # api only
npm run test:smoke     # only @smoke-tagged
npm run test:ui        # Playwright UI mode
npm run report         # open last Playwright HTML report

npm run check          # lint + typecheck (the PR gate)
```

### Allure report

Every run writes `allure-results/`. Build / open the Allure report (needs the Allure CLI's Java runtime):

```bash
npm run allure:serve      # generate + open in one step
npm run allure:generate   # write a static report to allure-report/
```

The same `allure-results/` is what an **Allure TestOps** instance ingests in CI — no code changes needed, only its uploader + token on the platform side.

## CI & quality gates

- **PR gate — static checks only.** `npm run check` (ESLint + `tsc --noEmit`)
  runs on every push/PR and must pass. Fast and deterministic.
- **E2E/API — manual.** A `workflow_dispatch` job runs the suite sharded inside
  the official Playwright container and merges the shards into one HTML report.
  It is **not** a PR gate: the target is a public third-party live site, so
  gating PRs on it would be flaky and slow. Against a controlled staging env
  this would flip to a smoke suite on PR + regression on schedule.

## How auth reuse works

`tests/auth.setup.ts` (the `setup` project) logs in once through the UI,
verifies the session, and saves `playwright/.auth/customer.json`. The `web-auth`
project loads that file via `use.storageState`, so its specs start already
authenticated. The file is git-ignored and regenerated each run.

## Known limitations (public third-party target)

- **Cloudflare bot challenge** blocks GitHub runner IPs, so the account specs
  `test.skip` on CI only (they pass locally). Fix: a bot-free test env or a
  self-hosted runner.
- **Shared demo account lockout** — repeated bad logins lock the public customer
  account (HTTP 423). The negative-login test registers a throwaway user instead
  of touching the shared account.

## Conventions

- Domains are folders; execution slices are tags: `@smoke`, `@catalog`, `@negative`, `@login` (login/credential flow), `@auth` (consumes the saved authenticated session).
- Config and credentials resolve from env (`src/utils/config.ts`), validated and never hardcoded.
- `npm run check` before pushing; format with `npm run format`.

## Roadmap

Cross-system / tooling ideas talked through but not built here:

- Telegram bot coverage via a `TelegramClient` service + cross-system validation.
- Auto-create Jira tickets on failure via a custom Playwright reporter.

Framework-scaling steps (deferred deliberately) are tracked in
[`docs/architecture-decisions.md`](docs/architecture-decisions.md#scalability-roadmap).
