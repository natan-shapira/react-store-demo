import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { Suspense, useEffect, type ReactNode } from "react";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { shouldRetry } from "./api/shouldRetry";
import { useAuthStore } from "./stores/useAuthStore";
import ModalWrapper from "./components/ModalWrapper/ModalWrapper";
import ProtectedRoute from "./routes/ProtectedRoute/ProtectedRoute";
import {
  AuthSkeleton,
  CartSkeleton,
  CheckoutSkeleton,
  HomeSkeleton,
  ProductSkeleton,
} from "./components/PageSkeletons/PageSkeletons";
import { lazyWithRetry } from "./utils/lazyWithRetry";
import AdminRoute from "./routes/AdminRoute/AdminRoute";
import { ADMIN_SECTIONS, AdminOverviewPage } from "./pages/AdminDashboardPage/adminSections";

const HomePage = lazyWithRetry(() => import("./pages/HomePage/HomePage"), "HomePage");
const ProductPage = lazyWithRetry(() => import("./pages/ProductPage/ProductPage"), "ProductPage");
const CartPage = lazyWithRetry(() => import("./pages/CartPage/CartPage"), "CartPage");
const CheckoutPage = lazyWithRetry(
  () => import("./pages/CheckoutPage/CheckoutPage"),
  "CheckoutPage"
);
const AuthPage = lazyWithRetry(() => import("./pages/AuthPage/AuthPage"), "AuthPage");
const NotFoundPage = lazyWithRetry(
  () => import("./pages/NotFoundPage/NotFoundPage"),
  "NotFoundPage"
);
const AdminDashboardPage = lazyWithRetry(
  () => import("./pages/AdminDashboardPage/AdminDashboardPage"),
  "AdminDashboardPage"
);

// The 404 page is tiny and rarely visited, so it loads without a placeholder
const notFoundPage = (
  <Suspense fallback={null}>
    <NotFoundPage />
  </Suspense>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});

// Keeps the navbar usable after a page crashes, and clears the error once the user navigates away
function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // void marks the promise as deliberately not awaited; checkAuth catches its own errors
    void checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <PageErrorBoundary>
              <Routes>
                <Route
                  path="/auth"
                  element={
                    <Suspense fallback={<AuthSkeleton />}>
                      <AuthPage />
                    </Suspense>
                  }
                />
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<HomeSkeleton />}>
                        <HomePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <Suspense fallback={<ProductSkeleton />}>
                        <ProductPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <Suspense fallback={<CartSkeleton />}>
                        <CartPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <Suspense fallback={<CheckoutSkeleton />}>
                        <CheckoutPage />
                      </Suspense>
                    }
                  />
                  {/* Non-admins get "not found", so the admin pages do not reveal that they exist */}
                  <Route element={<AdminRoute fallback={notFoundPage} />}>
                    {/* The layout renders the admin menu, and the matching child route in its <Outlet /> */}
                    <Route
                      path="/admin"
                      element={
                        <Suspense fallback={null}>
                          <AdminDashboardPage />
                        </Suspense>
                      }
                    >
                      <Route index element={<AdminOverviewPage />} />
                      {ADMIN_SECTIONS.map(({ path, Page }) => (
                        <Route key={path} path={path} element={<Page />} />
                      ))}
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={notFoundPage} />
              </Routes>
            </PageErrorBoundary>
          </main>
          <ModalWrapper />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
