# Review: Toolshop Playwright + TypeScript Automation Framework

Дата ревью: 2026-06-03  
Роль ревьюера: Senior SDET / Test Automation Architect  
Цель: оценить фреймворк как portfolio/interview-grade основу для Web E2E + API automation на TypeScript + Playwright.

## Executive Summary

Фреймворк уже выглядит выше среднего для demo/portfolio проекта: есть Playwright projects, dependency-based auth setup, typed service layer, fixtures как DI, Page Object + Component Object Model, dynamic test data, path aliases, ESLint, Allure, GitHub Actions и понятный README.

Главный архитектурный вывод: направление выбрано правильное, но перед собеседованиями стоит усилить несколько мест, чтобы фреймворк выглядел не просто "чисто написанным", а production-aware:

- разделить public web tests и authenticated web tests на разные Playwright projects;
- перенести authenticated session reuse в project-level `use.storageState`, а не создавать `authedPage` вручную через `browser.newContext`;
- добавить typecheck в npm scripts и CI;
- сделать config validation вместо silent fallback на demo credentials;
- усилить API layer: отделить raw client, domain client и assertion helpers;
- добавить schema/contract validation для API responses;
- расширить test data strategy: cleanup, immutable builders, user lifecycle;
- убрать/не коммитить generated artifacts и storage state;
- привести CI comments/version pinning к реальному package lock.

Проверки, которые были запущены во время ревью:

- `npm run lint` - passed;
- `npx tsc --noEmit` - passed;
- `npm run test:api` - 3 passed;
- `npm run test:web` - 7 passed, включая `setup` auth project.

## Что Уже Сделано Хорошо

### 1. Playwright projects используются осознанно

В `playwright.config.ts` есть отдельные проекты `setup`, `web`, `api`. Это правильная база для масштабирования, потому что suite slicing находится в конфиге, а не размазан по shell scripts.

Сильные стороны:

- `setup` project сохраняет `storageState`;
- `web` зависит от `setup`;
- `api` отделен от browser execution;
- `fullyParallel: true`;
- `forbidOnly` включен для CI;
- retries включены только в CI;
- trace/screenshot/video настроены разумно.

### 2. Auth reuse реализован в правильном направлении

`tests/auth.setup.ts` делает login один раз, проверяет URL `/account`, ждет `localStorage.auth-token` и сохраняет storage state. Это зрелый подход: тесты не должны логиниться через UI в каждом сценарии.

Отдельно хорошо, что перед сохранением state есть guard:

```ts
await expect(page).toHaveURL(/account/);
await page.waitForFunction(() => !!window.localStorage.getItem('auth-token'));
```

Это снижает риск сохранить пустой/битый session state.

### 3. Fixtures как DI

`src/fixtures/app.fixture.ts` создает `loginPage`, `productsPage`, `accountPage`, `api`. Это хороший компромисс между DRY и читаемостью: specs не делают `new LoginPage(page)` вручную.

### 4. Page Objects не забиты assertions

Page Objects в `src/pages` в основном содержат actions и locators, а assertions живут в specs. Это правильная граница ответственности:

- Page Object знает, как взаимодействовать со страницей;
- test знает, какой бизнес-результат ожидается.

### 5. Component Object Model уже есть

`HeaderNav` вынесен в `src/components/HeaderNav.ts` и композится в `AccountPage`. Это хороший сигнал для интервью: автор понимает, что header/modal/sidebar - не page object, а reusable component.

### 6. API requests не размазаны по тестам

`ToolshopApi` держит backend calls в одном месте. Тесты читаются на уровне бизнес-действий: `api.register`, `api.login`, `api.getProducts`.

### 7. Test data builder есть и решает collision problem

`UserBuilder` генерирует уникальный email через faker UUID. Для parallel API registration tests это правильно.

### 8. Репозиторий уже имеет engineering hygiene

Есть:

- `strict: true` в TypeScript;
- ESLint + eslint-plugin-playwright;
- Prettier/lint-staged/Husky;
- README с архитектурными решениями;
- GitHub Actions для lint и manual Playwright run;
- `.gitignore` для reports, auth state, env files.

## High Priority Improvements

### P1. Разделить public web и authenticated web projects

Сейчас весь `web` project зависит от `setup`:

```ts
{
  name: 'web',
  testDir: './tests/web',
  use: { ...devices['Desktop Chrome'] },
  dependencies: ['setup'],
}
```

Это означает, что даже public tests вроде catalog/search/login-negative требуют предварительного login setup. В локальном прогоне это видно: `npm run test:web` запускает 7 tests, включая `setup`.

Почему это проблема:

- public tests становятся зависимыми от валидности credentials;
- login page tests концептуально не должны требовать already-auth setup;
- если login setup упадет из-за Cloudflare/account issue, упадет весь web suite, даже публичный catalog;
- на интервью могут спросить: "Why does a non-auth test need auth setup?"

Рекомендация:

```ts
projects: [
  {
    name: 'setup',
    testMatch: /auth\.setup\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'web-public',
    testDir: './tests/web',
    testIgnore: /account\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'web-auth',
    testDir: './tests/web',
    testMatch: /account\.spec\.ts/,
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: config.authFile,
    },
  },
  {
    name: 'api',
    testDir: './tests/api',
  },
];
```

Тогда:

- unauth tests используют обычный clean context;
- auth tests стартуют уже авторизованными;
- dependency setup нужен только там, где реально нужен.

### P1. Убрать custom `authedPage` и использовать Playwright-managed `page`

Сейчас authenticated page создается вручную:

```ts
authedPage: async ({ browser }, use) => {
  const context = await browser.newContext({ storageState: config.authFile });
  const page = await context.newPage();
  await use(page);
  await context.close();
};
```

Идея понятная, но для framework best practices лучше не плодить вторую page fixture без необходимости.

Риски текущего подхода:

- вручную созданный context легче случайно оторвать от project-level `use` options;
- future options вроде locale/timezone/permissions/geolocation/httpCredentials/baseURL могут быть забыты;
- artifacts/debug behavior сложнее объяснять, потому что default `page` и `authedPage` живут в разных context lifecycle;
- тесты получают два разных способа работать со страницей: `page` и `authedPage`.

Лучше:

- auth state задается на уровне project `use.storageState`;
- `AccountPage` создается от обычной `page` fixture;
- specs не знают, "как именно" они авторизованы.

Пример fixture после изменения:

```ts
type AppFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  accountPage: AccountPage;
  api: ToolshopApi;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  api: async ({ request }, use) => {
    await use(new ToolshopApi(request));
  },
});
```

Это проще, чище и лучше объясняется на интервью.

### P1. Добавить config validation

Сейчас config silently fallback-ится на public demo credentials:

```ts
email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
```

Для portfolio demo это удобно. Для production-grade framework лучше явно разделить режимы:

- local/demo mode может иметь defaults;
- CI/staging/prod должны fail fast, если env vars не заданы.

Риски:

- CI может случайно гонять тесты на public account;
- неверный base URL не будет замечен до runtime failure;
- секреты и environment contract не документированы типами.

Рекомендация:

- добавить `src/utils/env.ts` или усилить `config.ts`;
- валидировать URL через `new URL(value)`;
- в CI требовать `WEB_BASE_URL`, `API_BASE_URL`, `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`;
- хранить demo defaults только при `ALLOW_DEMO_DEFAULTS=true` или `NODE_ENV !== 'ci'`.

Пример идеи:

```ts
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
```

### P1. Добавить `typecheck` script и включить его в CI

Сейчас `npx tsc --noEmit` проходит, но в `package.json` нет script:

```json
"lint": "eslint ."
```

Рекомендация:

```json
"typecheck": "tsc --noEmit",
"check": "npm run lint && npm run typecheck"
```

И в `.github/workflows/lint.yml` запускать:

```yaml
- name: Run static checks
  run: npm run check
```

Почему важно:

- ESLint не заменяет TypeScript compiler;
- на интервью это простой, сильный сигнал maturity;
- decorators/path aliases/generics лучше ловить compile check-ом.

## Auth And Fixture Design

### Что с авторизацией сейчас хорошо

Текущий `auth.setup.ts` находится в правильном месте: отдельный setup test, подключенный dependency project. Это лучше, чем делать login в `beforeEach`.

Хорошо:

- login flow живет в одном месте;
- state сохраняется только после проверки успешного login;
- authenticated specs не повторяют login steps;
- storage state лежит в ignored `playwright/.auth`.

### Что стоит изменить

Главная рекомендация: authenticated state должен быть project concern, а не custom page concern.

Целевая модель:

- `tests/auth.setup.ts` создает `playwright/.auth/customer.json`;
- `web-auth` project использует `use.storageState`;
- `accountPage` строится от default `page`;
- public tests не зависят от setup.

Такую модель проще объяснить:

"Setup project prepares state. Authenticated project consumes it. Fixtures only provide domain objects, not browser lifecycle."

### Нужен ли login через UI для setup?

Для demo/portfolio - да, это приемлемо и наглядно.

Для production - зависит:

- если цель E2E auth coverage, один UI login smoke test нужен;
- если цель быстро подготовить session для unrelated authenticated tests, лучше делать auth через API, если приложение позволяет получить token/cookies корректно.

Идеальная стратегия:

- один UI test проверяет login form;
- setup auth state создается через API или backend helper;
- если API-login не может корректно подготовить browser state, setup через UI допустим, но должен быть изолирован от public suite.

### Нужен ли `authedPage` fixture?

Сейчас нет сильной причины держать `authedPage`. Она добавляет второй способ получить page. Лучше убрать.

Когда custom page fixture оправдана:

- нужно одновременно иметь два пользователя в одном тесте;
- нужен отдельный browser context для multi-session scenario;
- нужен special context с permissions/geolocation/locale.

Для обычных account tests project-level `storageState` чище.

## Architecture / OOP / SOLID

### Page Objects

Текущий стиль хороший: POM не делает assertions, specs остаются читаемыми.

Что улучшить:

1. Не раздувать root fixtures всеми page objects.

   Сейчас page objects мало, поэтому нормально. Когда их станет 20+, root fixture превратится в service locator. Тогда лучше:
   - разделять fixtures по domain: `auth.fixture.ts`, `catalog.fixture.ts`, `account.fixture.ts`;
   - экспортировать domain-specific `test`;
   - или создать `App` facade только для действительно сквозных сценариев.

2. Не раскрывать слишком много locators наружу.

   `readonly locators` в Playwright POM - нормальный паттерн, но если tests начнут активно дергать внутренности страницы, POM станет "locator bag".

   Хороший баланс:
   - public locators для stable assertions;
   - methods для business actions;
   - semantic getters для повторяемых assertions.

3. Сделать selector strategy еще строже.

   В `ProductsPage` есть:

   ```ts
   this.productCards = page.getByTestId('product-name').locator('xpath=ancestor::a');
   ```

   Комментарий в файле говорит "no brittle CSS chains", но XPath ancestor - тоже structural selector. Лучше использовать role/test id на card/link, если приложение позволяет. Если нет, лучше хотя бы инкапсулировать этот workaround и не рекламировать как best practice.

4. `openProductByName` лучше сделать exact.

   Сейчас:

   ```ts
   await this.productNames.filter({ hasText: name }).first().click();
   ```

   Риск: `Pliers` может совпасть с несколькими товарами. Лучше использовать exact matcher, role link, или method `productByName(name)`.

### Component Objects

`HeaderNav` сделан правильно: компонент получает root locator и не знает про `Page`. Это хороший SOLID-friendly дизайн.

Можно усилить:

- добавить factory/helper в pages, если components начнут повторяться;
- держать component root private/readonly;
- методы компонента должны быть action-level: `signOut`, `openUserMenu`, `goToFavorites`.

### Service Layer

`ToolshopApi` сейчас совмещает:

- HTTP client;
- domain methods;
- assertions on response status;
- response typing.

Для маленького demo это ок. Для production лучше разделить:

1. Low-level client:
   - делает request;
   - возвращает `APIResponse` или parsed body;
   - не assert-ит.

2. Domain API:
   - `registerUser`, `login`, `getProducts`;
   - может бросать typed errors или возвращать typed results.

3. Test assertions:
   - contract/schema checks;
   - negative response assertions.

Компромиссный вариант: оставить assertive methods, но явно назвать raw methods:

- `loginResponse` - уже хорошо;
- `registerResponse`;
- `getProductsResponse`;
- `register` - happy-path helper, который assert-ит `response.ok()`.

### Data Builders

`UserBuilder` полезен, но сейчас `build()` возвращает mutable reference:

```ts
build(): NewUser {
  return this.user;
}
```

Лучше вернуть copy:

```ts
build(): NewUser {
  return structuredClone(this.user);
}
```

Почему:

- builder может быть переиспользован;
- тест может случайно изменить объект;
- immutable output проще дебажить.

Также стоит добавить:

- `withPassword(password)`;
- `withName(firstName, lastName)`;
- `withCountry(country)`;
- `withDefaults(overrides: PartialDeep<NewUser>)`, если будет много вариаций;
- cleanup strategy для созданных пользователей, если API поддерживает delete.

## API Testing

### Добавить schema validation

Сейчас API contract проверяется вручную:

```ts
expect(product).toMatchObject({
  id: expect.any(String),
  name: expect.any(String),
  price: expect.any(Number),
  in_stock: expect.any(Boolean),
});
```

Это нормально для demo, но зрелее будет использовать schema validation:

- `zod`;
- `valibot`;
- JSON Schema + `ajv`.

Преимущество:

- runtime validation;
- reusable schemas;
- понятные contract errors;
- можно использовать same schema в service layer и tests.

Пример направления:

```ts
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  in_stock: z.boolean(),
});
```

### Добавить negative API coverage

Сейчас есть login wrong password. Хорошо добавить:

- register duplicate email;
- register invalid email;
- register weak password;
- products invalid page value;
- unauthorized access to protected endpoint, если есть.

Это покажет, что API suite проверяет не только happy path.

### Добавить API auth context

Если появятся protected API endpoints, лучше иметь fixture:

```ts
authApi: ToolshopApi;
```

Варианты:

- login через API и добавить Authorization header в request context;
- создать отдельный `APIRequestContext` через `playwright.request.newContext`.

Важно не смешивать unauthenticated и authenticated clients.

## Test Design

### Тесты читаются хорошо

Например:

```ts
await productsPage.open();
await productsPage.search('Pliers');
await expect(productsPage.searchCaption).toBeVisible();
await expect(productsPage.productNames.first()).toContainText(/pliers/i);
```

Сценарий понятен без знания деталей DOM.

### Что стоит улучшить

1. Избегать `count()` без auto-wait expectation.

   Сейчас:

   ```ts
   expect(await productsPage.productNames.count()).toBeGreaterThan(0);
   ```

   Перед этим есть `toBeVisible()`, поэтому тест практически безопасен. Но как общий паттерн лучше:

   ```ts
   await expect(productsPage.productNames).toHaveCountGreaterThan(0);
   ```

   В Playwright нет встроенного `toHaveCountGreaterThan`, но можно сделать helper, либо оставить visible assertion и не дублировать count.

2. Для search лучше проверять все видимые результаты, а не только первый.

   Сейчас проверяется first product. Лучше:
   - получить texts;
   - проверить, что каждый содержит search term;
   - или проверить конкретный ожидаемый товар, если данные стабильны.

3. Logout test меняет state.

   Так как каждый auth test получает fresh storage state/context, это нормально. Но это еще один аргумент за project-level `storageState`: isolation должна быть очевидной.

4. Отдельно пометить tests against public live site.

   В README это есть. Можно также добавить tags:
   - `@live`;
   - `@third-party`;
   - `@flaky-risk`.

   Тогда на интервью легко объяснить, почему CI manual.

## CI / DevEx

### Версия Playwright: привести к одному источнику правды

В `package.json`:

```json
"@playwright/test": "^1.58.0"
```

В CI container:

```yaml
image: mcr.microsoft.com/playwright:v1.60.0-noble
```

В `package-lock.json` сейчас установлен Playwright 1.60.0, поэтому локально все хорошо. Но комментарий в CI говорит "Pin the tag to the @playwright/test version", а dependency в package.json не pinned exact.

Рекомендация:

- либо поставить exact `"@playwright/test": "1.60.0"`;
- либо обновить comment и осознанно разрешить caret;
- лучше exact pin для browser automation frameworks.

### Добавить static check workflow

Сейчас lint workflow запускает только ESLint. Нужно добавить typecheck.

Идеальный минимум:

```json
"check": "npm run lint && npm run typecheck"
```

### Добавить Playwright-specific scripts

Удобные scripts:

```json
"test:web:public": "playwright test --project=web-public",
"test:web:auth": "playwright test --project=web-auth",
"test:ui": "playwright test --ui",
"test:headed": "playwright test --headed",
"test:debug": "PWDEBUG=1 playwright test"
```

### GitHub Actions shell quoting

В CI:

```sh
if [ -n "${{ inputs.grep }}" ]; then ARGS="$ARGS --grep ${{ inputs.grep }}"; fi
```

Если grep содержит пробелы/спецсимволы, shell parsing может вести себя неожиданно. Для `workflow_dispatch` это не критичная security проблема, но лучше аккуратнее собрать args array в bash:

```sh
ARGS=(--shard="${{ matrix.shard }}/2")
if [ "${{ inputs.project }}" != "all" ]; then ARGS+=(--project="${{ inputs.project }}"); fi
if [ -n "${{ inputs.grep }}" ]; then ARGS+=(--grep "${{ inputs.grep }}"); fi
npx playwright test "${ARGS[@]}"
```

### Manual E2E workflow - это честно, но README стоит уточнить

README говорит "CI with sharding", но workflow называется `Playwright Tests (manual)` и запускается только `workflow_dispatch`.

Лучше сформулировать:

- PR gate: lint + typecheck;
- manual E2E/API: live third-party environment, sharded, report merge;
- optional scheduled smoke, если public site стабилен.

Это покажет взрослую позицию: не все E2E должны быть PR gate, особенно если target - чужой live site.

## Reporting / Allure

### `@step` decorator - хороший ход

Декоратор делает POM/API actions читаемыми в report:

```ts
return test.step(name, async () => target.call(this, ...args)) as Return;
```

Что улучшить:

- типизировать так, чтобы декоратор применялся только к async methods;
- подумать, нужны ли parameters в step name или attachments;
- не логировать passwords/secrets в step names;
- добавить Allure labels/severity только там, где есть смысл.

### Allure results должны оставаться artifacts, не source files

`.gitignore` уже игнорирует `allure-results/`, `allure-report/`, `playwright-report/`, `blob-report/`, `test-results/`, `playwright/.auth/`.

Это правильно. Перед публикацией repo стоит проверить:

```sh
git status --ignored
git ls-files allure-results blob-report playwright-report test-results playwright/.auth
```

Во время ревью generated directories были ignored, а tracked files среди них не нашлись.

## Code Quality Notes

### Использовать type-only imports

Например:

```ts
import { test as base, Page } from '@playwright/test';
```

Лучше:

```ts
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
```

Это не критично, но для TS framework hygiene выглядит лучше. Можно включить ESLint rule `@typescript-eslint/consistent-type-imports`.

### Уменьшить количество комментариев "смотрите research"

Комментарии вроде:

```ts
// Every test is isolated and parallel-safe (see research: Parallel Execution).
```

Для личного demo норм, но для production repo лучше:

- README/ADR хранит reasoning;
- кодовые комментарии объясняют только неочевидные решения;
- ссылки на "research" должны вести к реальному документу, если остаются.

Можно добавить `docs/decisions.md` или `docs/architecture.md`.

### Добавить ADR-lite

Для интервью очень сильный артефакт:

`docs/architecture-decisions.md`

Темы:

- why Playwright projects;
- why setup auth state;
- why POM + COM;
- why service layer;
- why E2E workflow is manual;
- why public third-party site is not PR gate.

Это покажет не только "я написал код", а "я умею принимать инженерные решения".

## Security / Secrets

### Storage state

`playwright/.auth/customer.json` игнорируется. Это правильно, потому что storage state содержит cookies/localStorage token.

Рекомендация:

- оставить ignored;
- не показывать его в README;
- в CI генерировать заново;
- если появятся реальные env credentials, использовать GitHub Secrets.

### Demo credentials

Public demo credentials в `.env.example` допустимы, потому что это публичный Toolshop account. Но в `config.ts` стоит явно назвать это demo behavior, чтобы не выглядело как привычка держать credentials в коде.

## Scalability Roadmap

### Следующий хороший слой: domain fixtures

Когда тестов станет больше, можно разнести:

```text
src/fixtures/
  base.fixture.ts
  auth.fixture.ts
  catalog.fixture.ts
  api.fixture.ts
```

И экспортировать:

```ts
export const test = base.extend<AuthFixtures & CatalogFixtures & ApiFixtures>(...)
```

Главная мысль: fixtures должны оставаться dependency injection layer, а не превращаться в "все обо всем".

### Добавить API cleanup/lifecycle

Если Toolshop API позволяет delete user:

- created users складывать в testInfo или worker-scoped registry;
- удалять в `afterEach`/fixture teardown;
- если delete недоступен, использовать уникальные emails и TTL naming.

### Добавить network layer для UI tests

Для более продвинутых web tests:

- wait for specific API response после search;
- assert UI result matches API result;
- intercept/route только для edge cases, не для happy-path E2E.

### Добавить visual/accessibility selectively

Не надо превращать demo в комбайн, но можно добавить:

- 1 accessibility smoke через `@axe-core/playwright`;
- 1 screenshot/visual example для stable component/page;
- отдельный project или tag, чтобы не смешивать с functional suite.

## Suggested Priority Plan

### Day 1: Auth/Fixture cleanup

1. Split `web-public` and `web-auth` projects.
2. Move `storageState: config.authFile` into `web-auth.use`.
3. Remove `authedPage` fixture.
4. Build `AccountPage` from default `page`.
5. Update scripts: `test:web:public`, `test:web:auth`.
6. Run `npm run lint`, `npm run typecheck`, `npm run test:web`.

### Day 2: Config and CI maturity

1. Add `typecheck` and `check` scripts.
2. Update lint workflow to run `npm run check`.
3. Pin Playwright version exactly or align CI comment with actual policy.
4. Improve workflow arg quoting.
5. Add config validation for CI env vars.

### Day 3: API contract and data model

1. Add schema validation with `zod` or `ajv`.
2. Add raw response methods for register/products.
3. Add negative API cases.
4. Make `UserBuilder.build()` return a clone.
5. Add more builder methods or object override helper.

### Day 4: Documentation polish

1. Update README to distinguish PR gate vs manual E2E.
2. Add architecture decisions doc.
3. Add "How auth reuse works" diagram/text.
4. Add "Known limitation: public third-party target/Cloudflare" section.

## Interview Talking Points

Если спросят про auth:

"I use a setup project to create storage state once, then authenticated projects consume that state via `use.storageState`. Public tests stay independent from auth setup. I avoid login in `beforeEach` because it is slow, flaky, and couples unrelated tests to the login UI."

Если спросят про fixtures:

"Fixtures are my DI layer. They create page objects, components through pages, and API clients. I avoid putting business assertions into fixtures. Browser lifecycle stays Playwright-managed unless a test explicitly needs multiple contexts/users."

Если спросят про Page Objects:

"Page objects expose user-level actions and stable locators for assertions. Shared UI pieces are component objects scoped by root locator. I avoid making every page/component a root fixture because that turns the fixture layer into a service locator."

Если спросят про API layer:

"Raw HTTP calls are isolated in service clients. For negative tests I expose raw response methods; for happy paths I expose domain helpers. For production I would add runtime schema validation and separate authenticated/unauthenticated API clients."

Если спросят почему E2E не PR gate:

"The target is a public third-party live site, so full E2E is manual/sharded and not a required PR gate. Static checks are the PR gate. In a real product environment I would run smoke against controlled staging on PR and broader regression on schedule/release."

## Final Verdict

Фреймворк уже можно показывать как сильный demo project. Он демонстрирует правильные идеи: fixtures, setup auth, POM/COM, API services, typed data, reports, CI.

Самое важное перед интервью - не переписывать все, а точечно убрать архитектурные шероховатости:

1. `web-public` vs `web-auth`;
2. project-level `storageState` вместо `authedPage`;
3. `typecheck` в scripts/CI;
4. config validation;
5. schema validation для API;
6. immutable/расширяемый test data builder.

После этих изменений проект будет выглядеть не как "я знаю Playwright", а как "я понимаю, как строить поддерживаемый automation framework".
