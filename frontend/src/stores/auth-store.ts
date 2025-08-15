/**
 * Minimal mock auth store for protected routes.
 * Replace with real API + JWT integration later.
 */
const TOKEN_KEY = "app_token";
const USER_KEY = "app_user";

export type User = {
  email: string;
  name?: string;
};

export function isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Mock sign in: set a fake token and basic user profile.
 */
export function signIn(email: string, name?: string) {
  localStorage.setItem(TOKEN_KEY, "mock_jwt_token");
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ email, name: name || email.split("@")[0] })
  );
}

/**
 * Remove token and user info.
 */
export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}