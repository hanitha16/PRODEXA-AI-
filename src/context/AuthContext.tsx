import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import authService, { type User } from "../services/authService";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, remember?: boolean) => string | null;
  signUp: (fullName: string, email: string, password: string, company?: string, jobTitle?: string) => string | null;
  loginDemoSession: (provider?: string) => User;
  resetPassword: (email: string, newPassword: string) => string | null;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, "fullName" | "email" | "company" | "jobTitle">>) => User | string;
  refreshUser: () => void;
  isDemoSession: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const refreshUser = useCallback(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const login = useCallback(
    (email: string, password: string, remember: boolean = false): string | null => {
      const err = authService.login(email, password);
      if (err) return err;
      if (remember) authService.saveAccount(email);
      setUser(authService.getCurrentUser());
      return null;
    },
    []
  );

  const signUp = useCallback(
    (fullName: string, email: string, password: string, company?: string, jobTitle?: string): string | null => {
      const err = authService.signUp(fullName, email, password, company, jobTitle);
      if (err) return err;
      setUser(authService.getCurrentUser());
      return null;
    },
    []
  );

  const loginDemoSession = useCallback((provider: string = "Google"): User => {
    const demoUser = authService.loginDemoSession(provider);
    setUser(demoUser);
    return demoUser;
  }, []);

  const resetPassword = useCallback((email: string, newPassword: string): string | null => {
    const err = authService.resetPassword(email, newPassword);
    return err;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Pick<User, "fullName" | "email" | "company" | "jobTitle">>): User | string => {
      if (!user) return "Not logged in.";
      const result = authService.updateProfile(user.id, updates);
      if (typeof result === "string") return result;
      setUser(result);
      return result;
    },
    [user]
  );

  const isDemoSession = user?.isDemoSession || authService.isDemoSession();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signUp,
        loginDemoSession,
        resetPassword,
        logout,
        updateProfile,
        refreshUser,
        isDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;

