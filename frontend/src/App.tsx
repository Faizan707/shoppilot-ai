import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AdminRoute } from './components/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminLayout } from './layouts/AdminLayout';
import { ShopLayout } from './layouts/ShopLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AddProduct } from './pages/admin/AddProduct';
import { Dashboard } from './pages/admin/Dashboard';
import { EditProduct } from './pages/admin/EditProduct';
import { ManageCategories } from './pages/admin/ManageCategories';
import { ManageCustomers } from './pages/admin/ManageCustomers';
import { ManageOrders } from './pages/admin/ManageOrders';
import { ManageProducts } from './pages/admin/ManageProducts';
import { Home } from './pages/shop/Home';
import { ProductDetails } from './pages/shop/ProductDetails';
import { Shop } from './pages/shop/Shop';
import { Cart } from './pages/user/Cart';
import { Checkout } from './pages/user/Checkout';
import { MyOrders } from './pages/user/MyOrders';
import { OrderDetails } from './pages/user/OrderDetails';
import { Profile } from './pages/user/Profile';
import { Wishlist } from './pages/user/Wishlist';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route element={<ShopLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="shop/:id" element={<ProductDetails />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<MyOrders />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="products/new" element={<AddProduct />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="categories" element={<ManageCategories />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="customers" element={<ManageCustomers />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3200} theme="colored" newestOnTop />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
