import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Account from "./pages/Account.jsx";
import Cart from "./pages/Cart.jsx";
import Components from "./pages/Components.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Configurator from "./pages/Configurator.jsx";
import Checkout from "./pages/Checkout.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import AIConfiguratorPage from "./pages/AIConfiguratorPage.jsx";
import OrderConfirmation from "./pages/OrderConfirmation";
import { HelmetProvider } from "react-helmet-async";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },

      { path: "configurator", element: <Configurator /> },
      { path: "ai-configurator",element: (<ProtectedRoute><AIConfiguratorPage /></ProtectedRoute>),},

      { path: "components", element: <Components /> },
      { path: "components/:category", element: <Components /> },

      { path: "wishlist", element: (<ProtectedRoute><Wishlist /></ProtectedRoute>),},
      { path: "cart", element: <Cart /> },
      { path: "account", element: (<ProtectedRoute><Account /></ProtectedRoute>),},
      { path: "checkout", element: <Checkout /> },
      { path: "info", element: <InfoPage /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "admin", element: (<ProtectedRoute><AdminDashboard /></ProtectedRoute>),},
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "order-confirmation", element: <OrderConfirmation /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </HelmetProvider>
);