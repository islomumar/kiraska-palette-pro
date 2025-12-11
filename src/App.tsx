import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { SiteContentProvider } from "@/hooks/useSiteContent";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { AdminSiteContentLayout } from "@/components/admin/AdminSiteContentLayout";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInventory from "./pages/admin/AdminInventory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SiteContentProvider>
            <EditModeProvider>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/products/new" element={<AdminProductForm />} />
                  <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/inventory" element={<AdminInventory />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  {/* Admin Site Content with nested routes */}
                  <Route path="/admin/site-content" element={<AdminSiteContentLayout><Index /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/products" element={<AdminSiteContentLayout><Products /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/products/:id" element={<AdminSiteContentLayout><ProductDetail /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/catalog" element={<AdminSiteContentLayout><Catalog /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/about" element={<AdminSiteContentLayout><About /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/contact" element={<AdminSiteContentLayout><Contact /></AdminSiteContentLayout>} />
                  <Route path="/admin/site-content/cart" element={<AdminSiteContentLayout><Cart /></AdminSiteContentLayout>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </EditModeProvider>
          </SiteContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
