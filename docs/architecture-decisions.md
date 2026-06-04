# Architecture Decisions

ADR-lite: the reasoning behind the framework's structure. Each entry is
_Context → Decision → Consequences_, kept short on purpose.

## 1. Playwright projects for suite slicing

**Context.** The suite has authenticated UI tests, public UI tests, and API
tests with very different setup needs.

**Decision.** Slice by Playwright project, not by shell scripts: `setup`,
`web-public`, `web-auth`, `api`. Slicing lives in `playwright.config.ts`.

**Consequences.** Each project carries only the dependencies it needs.
`web-public` runs in a clean context with no login; `web-auth` depends on
`setup`; `api` needs no browser. Selecting a slice is `--project=...`.

## 2. Authentication via a setup project + project-level storageState

**Context.** Logging in through the UI in every test (or in `beforeEach`) is
slow, flaky, and couples unrelated tests to the login form.

**Decision.** A `setup` project signs in once and saves `storageState`. The
`web-auth` project consumes it via `use.storageState`. No custom "authenticated
page" fixture — browser lifecycle stays Playwright-managed.

**Consequences.** Authenticated tests start logged in with zero per-test cost.
Auth is a _project_ concern, not a fixture concern; specs don't know how they
got authenticated. Public tests stay independent of login validity.

## 3. Assertion-free Page Objects + Component Object Model

**Context.** Page Objects that assert blur the line between "how to drive the
page" and "what the test expects".

**Decision.** Page Objects expose actions and `readonly` locators only;
assertions live in specs (web-first, auto-retrying). Shared UI (e.g.
`HeaderNav`) is a Component Object scoped by a root locator and composed into
the pages that show it — not a page, not a root fixture.

**Consequences.** Specs read as business intent; components are reused without
selector leakage. A component never reaches for `Page`, only its root locator.

## 4. Service layer: raw vs assertive methods + zod contracts

**Context.** Raw HTTP calls scattered across specs are unreadable, and a typed
response that isn't validated at runtime can silently drift from the API.

**Decision.** `ToolshopApi` owns all backend calls. Two flavours per endpoint:
`*Response` (raw `APIResponse`, no assertions, for negative/edge paths) and a
happy-path helper that asserts `ok()` and returns data validated against a zod
schema. Schemas in `src/services/schemas.ts` are the single source of truth;
TypeScript types are derived via `z.infer`.

**Consequences.** Negative tests assert status without throwing; happy paths
get typed, contract-checked data. A contract breach throws a descriptive
`ZodError` instead of a confusing downstream failure.

## 5. Fixtures as dependency injection, not a service locator

**Context.** It's tempting to register every Page Object as a fixture.

**Decision.** Fixtures provide domain objects (Page Objects, components,
service clients) so specs never call `new`. They hold no business assertions.

**Consequences.** As the suite grows past ~20 page objects, fixtures should be
split by domain (see Roadmap) so the root fixture never becomes a god-object.

## 6. E2E/API is manual; static checks are the PR gate

**Context.** The target is a public third-party live site (rate limits, bot
protection, shared demo data). Gating every PR on it would be flaky and slow.

**Decision.** The PR gate is **static checks only** (`lint` + `typecheck`).
The E2E/API suite is a manual `workflow_dispatch`, sharded, with a merged HTML
report.

**Consequences.** PRs stay fast and deterministic. Against a controlled staging
environment this decision would flip: a smoke suite on PR, broader regression
on schedule/release.

## 7. Configuration fails fast on CI

**Context.** Silent fallback to demo credentials risks CI running against the
wrong account or URL without anyone noticing.

**Decision.** `config.ts` validates env with a zod schema. Locally it falls
back to the public demo; on CI all vars are required and a missing/malformed
one throws a descriptive error before any test runs.

**Consequences.** Misconfiguration is caught immediately, not as a mid-run
failure. The manual workflow supplies the vars (public defaults, overridable).

## 8. `@step` decorator for automatic report steps

**Context.** Wrapping every action in `test.step(...)` by hand clutters Page
Objects.

**Decision.** A `@step` method decorator reports each call as
`Class.method`. Arguments are never interpolated into the step name, so secrets
can't leak; the decorator is typed to async methods only.

**Consequences.** Page Object / service actions become readable steps in both
the Playwright and Allure reports with no per-call boilerplate.

---

## Scalability roadmap

Deliberately **not** built at this size — captured so the boundaries are a
conscious choice, not an oversight. Each is picked up when the suite's growth
justifies it.

- **Domain-split fixtures.** Past ~20 page objects, split `app.fixture.ts` into
  `auth` / `catalog` / `account` fixtures and compose them, so the root fixture
  never becomes a service locator.
- **Authenticated API client.** A separate `APIRequestContext` carrying a Bearer
  token for protected endpoints, kept distinct from the unauthenticated client
  (never mix the two).
- **Network-aware UI tests.** Wait for / assert specific API responses after an
  action and cross-check UI against API; `route` only for edge cases, never for
  happy-path E2E.
- **Visual & accessibility smoke.** One `@axe-core/playwright` check and one
  screenshot example, isolated by tag/project so they don't mix with the
  functional suite.
- **Data lifecycle.** If the API gains a user-delete endpoint, register created
  users in a worker-scoped registry and tear them down in fixture teardown.
