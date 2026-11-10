# ReactShop

A storefront built with React 19 and TypeScript on top of the public [DummyJSON](https://dummyjson.com) API. Users sign in, browse products by category, manage a cart and review their order before checkout.

## Features

- **Catalog**: products by category (kept in the URL as `?category=`), 15 per page with pagination
- **Product details**: a full product page, plus a quick view modal from the catalog
- **Cart**: quantities, per-item selection for checkout, saved in `localStorage` across visits
- **Checkout preview**: a read-only summary of the selected items (placing orders is not implemented yet)
- **Authentication**: sign in through DummyJSON, protected routes, and a profile picture that is resized in the browser and stored locally
- **Admin area**: an admin dashboard at `/admin`, shown only to users whose DummyJSON role is `admin`; everyone else gets the "not found" page
- **Resilience**: API responses validated at runtime with Zod, retries for network and server errors only, loading skeletons, error messages with "Try again", an error boundary, and lazy-loaded pages that recover from stale chunks after a deploy
- **Accessibility**: a page title and focused heading on every route, modals with a focus trap and accessible name and description, and quantity changes announced to screen readers

## Backend: DummyJSON

ReactShop has no server of its own. All data comes from [DummyJSON](https://dummyjson.com), a free public API with fake store data, and its address is read from the `VITE_API_URL` environment variable (see [Environment variables](#environment-variables)). The app uses these endpoints:

| Data                              | Endpoint                                            |
| --------------------------------- | --------------------------------------------------- |
| Products, by page                 | `GET /products` and `GET /products/category/{slug}` |
| A single product                  | `GET /products/{id}`                                |
| Categories                        | `GET /products/categories`                          |
| Sign in                           | `POST /auth/login`                                  |
| The signed-in user and their role | `GET /auth/me`                                      |

Because DummyJSON is a demo API, only its existing users can sign in, and nothing the app sends is saved on the server. The cart and the profile picture are stored in the browser instead.

## Tech stack

| Area         | Tools                                  |
| ------------ | -------------------------------------- |
| UI           | React 19, Tailwind CSS 4, lucide-react |
| Routing      | React Router 7                         |
| Server state | TanStack Query 5                       |
| Client state | Zustand 5 (with `persist`)             |
| Validation   | Zod 4                                  |
| Build        | Vite 8, TypeScript 6 (strict)          |
| Testing      | Vitest 5, Testing Library, jsdom       |
| Code quality | ESLint, Prettier                       |

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm run dev
```

Then open the URL that Vite prints and sign in with the DummyJSON demo user:

- Username: `emilys`
- Password: `emilyspass`

`emilys` is an admin, so the navbar also shows a link to the admin dashboard. More demo users, including a regular user without admin access, are listed in [`docs/test-users.md`](docs/test-users.md).

### Environment variables

| Variable       | Description                                   | Value in `.env.example` |
| -------------- | --------------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the API the app sends requests to | `https://dummyjson.com` |

`.env` is ignored by git, so each machine keeps its own copy. `.env.example` is committed and documents the variables; copy it to `.env` before running the app, the tests or the build. Vite reads the value when the app is built or started, so restart `npm run dev` after changing it.

### Trying the profile picture upload

The profile picture is chosen from a file on your computer. To have test images at hand, put them in an `avatarImages/` folder at the project root; it is ignored by git, so the images stay on your machine.

## Scripts

| Command                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Start the development server                              |
| `npm run build`         | Type-check and build for production                       |
| `npm run preview`       | Serve the production build locally                        |
| `npm run type-check`    | Type-check the app and config with TypeScript             |
| `npm run lint`          | Run ESLint                                                |
| `npm run format`        | Format the project with Prettier                          |
| `npm run format:check`  | Check formatting without changing files                   |
| `npm test`              | Run the tests in watch mode                               |
| `npm run test:coverage` | Run the tests once and fail below the coverage thresholds |

## Project structure

```text
src/
├── api/          # fetch helpers, Zod schemas, ApiError, retry rules, React Query hooks
├── components/   # shared UI components, one folder per component
├── hooks/        # shared hooks (quantity picker, page title and focus)
├── modals/       # content components rendered inside the shared modal
├── pages/        # one folder per route
├── routes/       # route guards (ProtectedRoute)
├── stores/       # Zustand stores: auth, cart, modal
├── test/         # test setup, data factories and shared queries
├── types/        # shared TypeScript types
├── utils/        # formatting, error messages, image compression, lazy loading
└── validators/   # sign in and sign up form validation
```

Each component lives in its own PascalCase folder, named after the component, with its test file next to it (for example `components/Pagination/Pagination.tsx` and `Pagination.test.tsx`).

## Testing

Tests use Vitest with Testing Library in a jsdom environment. Shared setup lives in `src/test/`:

- `setup.ts`: registers the jest-dom matchers, and after each test unmounts the rendered tree, clears `localStorage` and resets the auth and cart stores
- `factories.ts`: builders for products, cart items and JSON responses
- `queries.ts`: shared queries, such as reading the current quantity

No test reaches the real API: the API modules are tested with `fetchWithAuth` mocked (and `fetchWithAuth` itself with `fetch` mocked), while components and pages mock the React Query hooks or the auth API.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to `main`: it installs with `npm ci`, creates `.env` from `.env.example`, then runs `type-check`, `lint`, `format:check`, `test:coverage` and `build`. A pull request should only be merged once all of them pass.

## Known limitations

### Sign up does not create an account

**What happens.** The sign up form is validated, and after a short delay that stands in for a network request, the auth store saves the new user's details without a token. The navbar decides what to show from the user, so it shows the new name and avatar. The protected pages decide from the token, so they send the user back to the sign in page. The details live only in this browser, and the new username and password cannot be used to sign in.

**Why.** DummyJSON has no real sign up endpoint. It can simulate adding a user, but it does not save the user and does not return a token, so there is no account to sign in to and nothing to authenticate later requests with.

**Why it was left this way.** This project focuses on the client side, and each workaround would have hidden the problem instead of solving it:

- Generating a token in the browser would make the app look signed in, but DummyJSON would reject that token with a 401 on the next authenticated request (for example `/auth/me` when the page reloads), which logs the user out.
- Signing the new user in as an existing DummyJSON user would show someone else's profile.
- Adding a backend or a mock server would solve it properly, but is outside the scope of a client-only project.

**What a real fix needs.** A sign up endpoint that creates the account and returns a token. `signup` in `src/stores/useAuthStore.ts` could then work like `login`: send the request, store the token and the user, and report errors to the form.

### The access token is stored in localStorage (temporary)

**What happens.** After sign in, the access token is kept in the auth store, which is saved to `localStorage` so the session survives a page reload. `fetchWithAuth` sends it with every request as an `Authorization: Bearer` header. Any JavaScript running on the page can read `localStorage`, so if an attacker ever managed to inject a script (an XSS attack), they could read the token and use it elsewhere. The usual protection is an `HttpOnly` cookie, which the browser sends with requests but JavaScript cannot read.

**Why DummyJSON's cookies cannot be used.** DummyJSON does set the tokens as `HttpOnly; Secure` cookies when you sign in, and it accepts the cookie instead of the header. But it sets them without a `SameSite` attribute, so browsers treat them as `SameSite=Lax`, and the app always runs on a different site than `dummyjson.com` (localhost while developing, its own domain once deployed). Browsers do not store or send `Lax` cookies on requests from another site. A test in Edge from `http://localhost:5173` confirmed this: sign in succeeded, but `GET /auth/me` with `credentials: "include"` returned `401 Access Token is required`, because the cookie was never sent. Safari and Firefox restrict cookies from other sites even more.

**Why this is temporary.** It is a limitation of building on a public demo API, not a design choice. Once DummyJSON is replaced by the project's own server on the same site as the app, the server can set the session in an `HttpOnly; Secure; SameSite` cookie. The client then changes in three places:

- `useAuthStore`: stop saving the token, so `partialize` keeps only the user.
- `fetchWithAuth`: send requests with `credentials: "include"` instead of the `Authorization` header.
- Token expiry and refresh move to the server.

**The risk in the meantime is small.** The tokens belong to DummyJSON's public demo accounts and expire after 60 minutes, and React escapes all rendered text; the app never uses `dangerouslySetInnerHTML`, the most common way to open an XSS hole in a React app.

### The admin role is only checked in the interface

**What happens.** The role comes from DummyJSON (`GET /auth/me`, right after signing in and on every page load), and `AdminRoute` uses it to decide whether to show the admin dashboard. The role saved in `localStorage` is always replaced by the server's answer, and the client never grants itself a role.

**Why this is not real protection.** Anything that runs in the browser can be changed by the user, so a check in the client only decides what the interface shows. Real protection means the server checks the role on every admin request. DummyJSON has no admin-only endpoints, so for now the admin dashboard only shows a placeholder and has nothing to protect.

**Once the project has its own server**, every admin endpoint must verify the role from the session on the server side. `AdminRoute` stays as it is, to keep non-admins away from pages they cannot use.

### Other limitations

- **Sign in with Google is not available.** Signing in with an external provider needs a server that verifies the provider's response and creates a session, and DummyJSON has no such endpoint.
- **Checkout is a preview.** The order summary is shown, but delivery details and payment are not implemented, and "Place order" is disabled.
- **The cart is stored per browser.** It lives in `localStorage` and is cleared on logout.
