# Toolshop Test Automation — Demo Framework

Playwright + TypeScript framework demonstrating a clean, scalable test architecture.
Targets the public [Toolshop](https://practicesoftwaretesting.com) app (Web UI + REST API).

> This is a **portfolio/demo** repo: it shows how I design and structure tests.
> It does not reimplement any product.

## What it demonstrates

- **Assertion-free Page Objects** — POMs expose actions + `readonly` locators; asserts live in specs (web-first, auto-retry).
- **Dependency injection via fixtures** — no `new` in spec files.
- **Service layer** — backend calls isolated in `ToolshopApi`, not scattered across tests.
- **Dynamic test data** — `UserBuilder` + faker, unique per run (parallel-safe).
- **Auth reuse** — a `setup` project signs in once and persists `storageState`; authenticated tests start logged in (no per-test login).
- **Resilient locators** — `data-test` / role-based, no brittle CSS chains.
- **Allure reporting** — a `@step` decorator turns Page Object / service actions into report steps automatically; specs add metadata (severity, feature/story, TMS links). The same output feeds Allure TestOps.
- **CI with sharding** — GitHub Actions runs shards in parallel and merges into one HTML report.

## Layout

```
src/
  pages/      LoginPage, ProductsPage, AccountPage   (UI interaction boundaries)
  services/   ToolshopApi                            (backend communication)
  data/       UserBuilder                            (dynamic test data)
  fixtures/   app.fixture                            (dependency injection)
  utils/      config, step                           (env config, @step decorator)
tests/
  auth.setup.ts                                      (logs in once, saves session)
  web/        login, products, account               (E2E)
  api/        auth, products                         (REST)
```

## Run

```bash
npm install
npx playwright install chromium
cp .env.example .env

npm test            # everything
npm run test:web    # web only
npm run test:api    # api only
npm run test:smoke  # only @smoke-tagged
npm run report      # open last Playwright HTML report
```

### Allure report

Every run writes `allure-results/`. Build / open the Allure report (needs the Allure CLI's Java runtime):

```bash
npm run allure:serve      # generate + open in one step
npm run allure:generate   # write a static report to allure-report/
```

The same `allure-results/` is what an **Allure TestOps** instance ingests in CI — no code changes needed, only its uploader + token on the platform side.

## Conventions

- Domains are folders; execution slices are tags (`@smoke`, `@auth`, `@catalog`).
- Config and credentials resolve from env (`src/utils/config.ts`), never hardcoded.
- Lint with `npm run lint` (eslint + eslint-plugin-playwright), format with `npm run format`.

## Roadmap (talked through, not built here)

- Telegram bot coverage via a `TelegramClient` service + cross-system validation.
- Auto-create Jira tickets on failure via a custom Playwright reporter.
