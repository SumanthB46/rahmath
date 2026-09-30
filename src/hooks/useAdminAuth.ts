import { useState, useCallback, useSyncExternalStore, useEffect } from "react";
import api, { LoginPayload } from "@/lib/api";
import { toast } from "sonner";

export interface AdminUser {
  id: number | string;
  name: string;
  email: string;
  role: "admin";
  mobile?: string;
  avatar?: string;
}

export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_USER_KEY = "admin_user";

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  initialized: boolean;
}

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { admin: null, token: null, initialized: false };
  }
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const userStr = localStorage.getItem(ADMIN_USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      token: token || null,
      admin: user && user.role === "admin" ? user : null,
      initialized: false,
    };
  } catch {
    return { admin: null, token: null, initialized: false };
  }
}

// Module-level singleton store so all route components share identical auth state
let currentState: AuthState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateAuthState(partial: Partial<AuthState>) {
  currentState = { ...currentState, ...partial };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return currentState;
}

function getServerSnapshot(): AuthState {
  return { admin: null, token: null, initialized: false };
}

let verificationStarted = false;

function verifyStoredSession() {
  if (typeof window === "undefined" || verificationStarted) return;
  verificationStarted = true;

  const currentToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const currentUser = localStorage.getItem(ADMIN_USER_KEY);

  if (!currentToken || !currentUser) {
    updateAuthState({ admin: null, token: null, initialized: true });
    return;
  }

  try {
    const parsed = JSON.parse(currentUser);
    if (parsed.role !== "admin") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      updateAuthState({ admin: null, token: null, initialized: true });
      return;
    }

    api.admin
      .getProfile()
      .then((res: any) => {
        if (res?.admin || res?.user) {
          const verifiedAdmin = res.admin || res.user;
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(verifiedAdmin));
          updateAuthState({ admin: verifiedAdmin, token: currentToken, initialized: true });
        } else {
          throw new Error("Invalid session");
        }
      })
      .catch(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        updateAuthState({ admin: null, token: null, initialized: true });
      });
  } catch {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    updateAuthState({ admin: null, token: null, initialized: true });
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("admin-unauthorized", () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    updateAuthState({ admin: null, token: null, initialized: true });
  });
}

export function useAdminAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verifyStoredSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await api.admin.login(payload);
      if (res.requires2FA) {
        return res;
      }

      if (res.token && res.admin && res.admin.role === "admin") {
        localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
        updateAuthState({ admin: res.admin, token: res.token, initialized: true });
        toast.success("Welcome, Administrator", {
          description: `Logged in as ${res.admin.name || res.admin.email}`,
        });
        return res.admin;
      } else {
        throw new Error(res.message || "Failed to authenticate administrator.");
      }
    } catch (err: any) {
      toast.error("Admin Login Failed", {
        description: err.message || "Invalid credentials or unauthorized access.",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (tempToken: string, code: string) => {
    setLoading(true);
    try {
      const res = await api.admin.verify2FA({ tempToken, code });
      if (res.token && res.admin && res.admin.role === "admin") {
        localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
        updateAuthState({ admin: res.admin, token: res.token, initialized: true });
        toast.success("Welcome, Administrator", {
          description: `Logged in as ${res.admin.name || res.admin.email}`,
        });
        return res.admin;
      } else {
        throw new Error(res.message || "Failed to verify 2FA code.");
      }
    } catch (err: any) {
      toast.error("2FA Verification Failed", {
        description: err.message || "Invalid Google Authenticator code.",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    updateAuthState({ admin: null, token: null, initialized: true });
    toast.info("Admin Signed Out", {
      description: "You have been securely signed out of the Admin Studio.",
    });
  }, []);

  return {
    admin: state.admin,
    token: state.token,
    isAuthenticated: !!state.token && !!state.admin && state.admin.role === "admin",
    loading,
    initialized: state.initialized,
    login,
    verify2FA,
    logout,
  };
}

export default useAdminAuth;
