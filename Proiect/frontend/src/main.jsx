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

function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8">
        <h1 className="mb-2 text-3xl font-bold text-white">{title}</h1>
        <p className="text-slate-400">
          Pagina este în lucru. O voi implementa în pasul următor.
        </p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },

      { path: "configurator", element: <PlaceholderPage title="Configurator PC" /> },
      { path: "ai-configurator", element: <PlaceholderPage title="AI Configurator" /> },

      { path: "components", element: <PlaceholderPage title="Componente" /> },
      { path: "components/*", element: <PlaceholderPage title="Componente" /> },

      { path: "wishlist", element: <PlaceholderPage title="Wishlist" /> },
      { path: "cart", element: <PlaceholderPage title="Coș" /> },
      { path: "account", element: <PlaceholderPage title="Cont" /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);