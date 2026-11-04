"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Determine if current route is protected
    const isLoginPage = pathname === "/signin" || pathname === "/admin/login";
    const isProtectedRoute =
      pathname.startsWith("/admin") ||
      pathname === "/registration" ||
      pathname === "/examiner" ||
      pathname === "/authorization";

    const performLogout = (reason: string = "session_expired") => {
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("role");
      } catch (e) {
        console.error("Error clearing storage", e);
      }
      window.location.href = `/signin?reason=${encodeURIComponent(reason)}`;
    };

    const verifyToken = () => {
      if (!isProtectedRoute || isLoginPage) return;

      const token = localStorage.getItem("adminToken");
      if (!token) {
        performLogout("unauthorized");
        return;
      }

      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          performLogout("invalid_token");
          return;
        }

        // Base64URL to JSON decoding
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);

        if (payload.exp) {
          const expiresAt = payload.exp * 1000;
          const timeLeft = expiresAt - Date.now();

          if (timeLeft <= 0) {
            // Token has expired
            performLogout("session_expired");
            return;
          }

          // Clear any existing timer
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          // Set timer for exact expiration (capped at max 32-bit int)
          const timeoutDelay = Math.min(timeLeft, 2147483647);
          timerRef.current = setTimeout(() => {
            performLogout("session_expired");
          }, timeoutDelay);
        }
      } catch (err) {
        console.error("Token verification failed", err);
        performLogout("invalid_token");
      }
    };

    // Verify immediately on route change
    verifyToken();

    // Check periodically (every 30 seconds)
    const interval = setInterval(verifyToken, 30000);

    // Check when user returns to or focuses the tab / re-opens laptop
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        verifyToken();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", verifyToken);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", verifyToken);
    };
  }, [pathname]);

  // Global fetch 401 interceptor (catches expired token response from backend)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : (args[0] as Request)?.url || "";

        if (url.includes("/api/admin")) {
          // If on a protected route, auto-logout
          const currentPath = window.location.pathname;
          if (
            currentPath !== "/signin" &&
            currentPath !== "/admin/login" &&
            (currentPath.startsWith("/admin") ||
              currentPath === "/registration" ||
              currentPath === "/examiner" ||
              currentPath === "/authorization")
          ) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            localStorage.removeItem("role");
            window.location.href = "/signin?reason=session_expired";
          }
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

