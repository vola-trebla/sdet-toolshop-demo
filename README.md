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
- **Resilient locators** — `data-test` / role-based, no brittle CSS chains.
- **CI with sharding** — GitHub Actions runs shards in parallel and merges into one HTML report.

## Layout

```
src/
  pages/      LoginPage, ProductsPage   (UI interaction boundaries)
  services/   ToolshopApi               (backend communication)
  data/       UserBuilder               (dynamic test data)
  fixtures/   app.fixture               (dependency injection)
  utils/      config                    (environment-driven config)
tests/
  web/        login, products           (E2E)
  api/        auth, products            (REST)
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
npm run report      # open last HTML report
```

## Conventions

- Domains are folders; execution slices are tags (`@smoke`, `@auth`, `@catalog`).
- Config and credentials resolve from env (`src/utils/config.ts`), never hardcoded.
- Lint with `npm run lint` (eslint + eslint-plugin-playwright), format with `npm run format`.

## Roadmap (talked through, not built here)

- Auth reuse via a `setup` project + `storageState` (login once, reuse across specs).
- Telegram bot coverage via a `TelegramClient` service + cross-system validation.
- Auto-create Jira tickets on failure via a custom Playwright reporter.
- Allure reporting.
