# ReactShop

A storefront built with React 19 and TypeScript on top of the public [DummyJSON](https://dummyjson.com) API. Users sign in, browse products by category, manage a cart and review their order before checkout.

## Features

- **Catalog**: products by category (kept in the URL as `?category=`), 15 per page with pagination
- **Product details**: a full product page, plus a quick view modal from the catalog
- **Cart**: quantities, per-item selection for checkout, saved in `localStorage` across visits
- **Checkout preview**: a read-only summary of the selected items (placing orders is not implemented yet)
- **Authentication**: sign in through DummyJSON, protected routes, and a profile picture that is resized in the browser and stored locally
- **Resilience**: API responses validated at runtime with Zod, retries for network and server errors only, loading skeletons, error messages with "Try again", an error boundary, and lazy-loaded pages that recover from stale chunks after a deploy
- **Accessibility**: a page title and focused heading on every route, modals with a focus trap and accessible name and description, and quantity changes announced to screen readers

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
npm run dev
```

Then open the URL that Vite prints and sign in with the DummyJSON demo user:

- Username: `emilys`
- Password: `emilyspass`

### Environment variables

| Variable       | Description                   | Default (in `.env`)     |
| -------------- | ----------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the DummyJSON API | `https://dummyjson.com` |

`.env` is committed because it holds only the public API address. To point the app elsewhere locally, create a `.env.local` file; it overrides `.env` and is ignored by git.

## Scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start the development server              |
| `npm run build`         | Type-check and build for production       |
| `npm run preview`       | Serve the production build locally        |
| `npm run lint`          | Run ESLint                                |
| `npm run format`        | Format the source files with Prettier     |
| `npm test`              | Run the tests in watch mode               |
| `npm run test:coverage` | Run the tests once with a coverage report |

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

## Known limitations

- **Sign up is simulated.** DummyJSON has no real sign up endpoint, so signing up creates neither an account nor a session: the app returns to the sign in page, and only existing DummyJSON users can sign in.
- **Checkout is a preview.** The order summary is shown, but delivery details and payment are not implemented, and "Place order" is disabled.
- **The cart is stored per browser.** It lives in `localStorage` and is cleared on logout.
