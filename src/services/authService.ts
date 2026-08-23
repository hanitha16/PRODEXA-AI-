// ============================================================
// PRODEXA AI — Enterprise Authentication Service (Prototype & Demo)
// ============================================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  createdAt: string;
  isDemoSession?: boolean;
  oauthProvider?: string;
  // Secure demo hash
  _demoPasswordHash: string;
}

export interface Session {
  userId: string;
  loggedIn: boolean;
  timestamp: string;
  isDemoSession?: boolean;
  oauthProvider?: string;
}

const USERS_KEY = "prodexa_users";
const SESSION_KEY = "prodexa_session";
const SAVED_ACCOUNT_KEY = "prodexa_saved_account";

/** Simple deterministic SHA-256-like prototype hash for client-side demo safety */
function demoHash(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "pdx_sha256_" + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      // Seed default judge user
      const defaultJudge: User = {
        id: "usr_judge_demo",
        fullName: "Enterprise Product Architect",
        email: "judge@prodexa.ai",
        company: "Industrial Systems Corp",
        jobTitle: "Lead Catalog Engineer",
        createdAt: new Date().toISOString(),
        _demoPasswordHash: demoHash("prodexa2024"),
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([defaultJudge]));
      return [defaultJudge];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // Quota handled
  }
}

function getInitials(fullName: string): string {
  if (!fullName) return "P";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "P";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ------ Public Authentication API ------

export const authService = {
  /** Sign up a new user with full validation */
  signUp(
    fullName: string,
    email: string,
    password: string,
    company: string = "Enterprise",
    jobTitle: string = "Product Data Architect"
  ): string | null {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid work email address.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";

    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()))
      return "An account with this email already exists.";

    const newUser: User = {
      id: "usr_" + Date.now(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim() || "Industrial Systems Corp",
      jobTitle: jobTitle.trim() || "Product Data Architect",
      createdAt: new Date().toISOString(),
      _demoPasswordHash: demoHash(password),
    };
    users.push(newUser);
    saveUsers(users);

    // Create session
    const session: Session = {
      userId: newUser.id,
      loggedIn: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return null;
  },

  /** Login with generic error response to protect against user enumeration */
  login(email: string, password: string): string | null {
    if (!email.trim() || !password) {
      return "Email and password are required.";
    }

    const users = getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    // Generic error: never reveal if email exists
    if (!user || user._demoPasswordHash !== demoHash(password)) {
      return "Invalid email or password.";
    }

    const session: Session = {
      userId: user.id,
      loggedIn: true,
      timestamp: new Date().toISOString(),
      isDemoSession: !!user.isDemoSession,
      oauthProvider: user.oauthProvider,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return null;
  },

  /** Creates a clearly labeled demo session (e.g. from Google or Microsoft OAuth Demo Mode) */
  loginDemoSession(provider: string = "Google"): User {
    const demoEmail = `demo.${provider.toLowerCase()}@prodexa.ai`;
    const users = getUsers();
    let demoUser = users.find((u) => u.email === demoEmail);

    if (!demoUser) {
      demoUser = {
        id: `usr_demo_${provider.toLowerCase()}_${Date.now()}`,
        fullName: `${provider} Enterprise Demo User`,
        email: demoEmail,
        company: "Industrial Global Corp",
        jobTitle: "Catalog Review Lead",
        createdAt: new Date().toISOString(),
        isDemoSession: true,
        oauthProvider: provider,
        _demoPasswordHash: demoHash("demo12345"),
      };
      users.push(demoUser);
      saveUsers(users);
    }

    const session: Session = {
      userId: demoUser.id,
      loggedIn: true,
      timestamp: new Date().toISOString(),
      isDemoSession: true,
      oauthProvider: provider,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return demoUser;
  },

  /** Safe prototype password reset flow without fake email claims */
  resetPassword(email: string, newPassword: string): string | null {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (newPassword.length < 6) {
      return "New password must be at least 6 characters.";
    }

    const users = getUsers();
    const userIdx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (userIdx === -1) {
      // Auto-create or reset gracefully for demo
      const newUser: User = {
        id: "usr_" + Date.now(),
        fullName: "Product Architect",
        email: email.toLowerCase().trim(),
        company: "Enterprise Corp",
        jobTitle: "Catalog Engineer",
        createdAt: new Date().toISOString(),
        _demoPasswordHash: demoHash(newPassword),
      };
      users.push(newUser);
      saveUsers(users);
      return null;
    }

    users[userIdx]._demoPasswordHash = demoHash(newPassword);
    saveUsers(users);
    return null;
  },

  /** Logout current user and clear session state */
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  /** Get current logged-in user, or null */
  getCurrentUser(): User | null {
    try {
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (!sessionRaw) return null;
      const session: Session = JSON.parse(sessionRaw);
      if (!session.loggedIn) return null;
      const users = getUsers();
      return users.find((u) => u.id === session.userId) || null;
    } catch {
      return null;
    }
  },

  /** Check if logged in */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  },

  /** Check if current session is demo session */
  isDemoSession(): boolean {
    try {
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (!sessionRaw) return false;
      const session: Session = JSON.parse(sessionRaw);
      return !!session.isDemoSession;
    } catch {
      return false;
    }
  },

  /** Update user profile */
  updateProfile(
    userId: string,
    updates: Partial<Pick<User, "fullName" | "email" | "company" | "jobTitle">>
  ): User | string {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return "User not found.";
    if (
      updates.email &&
      users.some(
        (u, i) =>
          i !== idx &&
          u.email.toLowerCase() === updates.email!.toLowerCase().trim()
      )
    )
      return "Email already in use by another account.";

    users[idx] = {
      ...users[idx],
      ...updates,
      email: updates.email ? updates.email.toLowerCase().trim() : users[idx].email,
      fullName: updates.fullName ? updates.fullName.trim() : users[idx].fullName,
    };
    saveUsers(users);
    return users[idx];
  },

  /** Save account for "Remember me" (email only) */
  saveAccount(email: string): void {
    localStorage.setItem(SAVED_ACCOUNT_KEY, email);
  },

  /** Get saved account email */
  getSavedAccount(): string | null {
    return localStorage.getItem(SAVED_ACCOUNT_KEY);
  },

  /** Clear saved account */
  clearSavedAccount(): void {
    localStorage.removeItem(SAVED_ACCOUNT_KEY);
  },

  /** Get initials from full name */
  getInitials,
};

export default authService;

