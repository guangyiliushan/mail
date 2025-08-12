/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppShell from "../layouts/app-shell";

// Auth pages (modularized)
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import Verify from "../pages/auth/verify";

import Inbox from "../pages/mail/inbox";
import Compose from "../pages/mail/compose";
import SettingsSecurity from "../pages/settings/security";

import { isAuthenticated } from "../stores/auth-store";

/**
 * Protect routes that require authentication.
 * If not authenticated, redirect to /auth/login.
 */
function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
}

/**
 * Lightweight layout for auth pages
 */
function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-[980px] px-4 py-2 text-sm font-medium">
          账号与安全
        </div>
      </header>
      <main className="mx-auto max-w-[980px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  // Auth routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify", element: <Verify /> },
      // 可在后续追加 forgot/reset
    ],
  },

  // App routes (wrapped by AppShell)
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/mail/inbox" replace /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "mail/inbox", element: <Inbox /> },
          { path: "mail/compose", element: <Compose /> },
          { path: "settings/security", element: <SettingsSecurity /> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;