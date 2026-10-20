import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import ProductPage from "./pages/ProductPage/ProductPage";
import CartPage from "./pages/CartPage/CartPage";
import ModalWrapper from "./components/ModalWrapper/ModalWrapper";
import AuthPage from "./pages/AuthPage/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute/ProtectedRoute";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

const queryClient = new QueryClient();

function App() {

  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
          </main>
          <ModalWrapper />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
