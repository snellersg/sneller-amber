"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  userEmail: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkAdminStatus = async (authUser: User) => {
    try {
      // Add timeout to prevent hanging on database queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Admin check timeout")), 10000),
      );

      const queryPromise = supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();

      const { data: userData, error: userError } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      // Only process real errors (not empty objects)
      const hasRealError = userError && typeof userError === 'object' && 
        (userError.message || userError.code || userError.details);
      
      if (hasRealError) {
        console.error("Error checking admin status:", userError);
        setIsAdmin(false);
      } else if (userData?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      // Silently handle timeouts - just set to non-admin
      if (error instanceof Error && error.message === "Admin check timeout") {
        setIsAdmin(false);
      } else {
        // Log other errors
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    }
  };

  const refreshAuth = async () => {
    try {
      // Add timeout to prevent hanging on auth check
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth refresh timeout")), 8000),
      );

      const authPromise = supabase.auth.getUser();

      const {
        data: { user: authUser },
        error,
      } = (await Promise.race([authPromise, timeoutPromise])) as any;

      if (error) {
        // Handle invalid refresh token errors gracefully
        if (
          error.message?.includes("Invalid Refresh Token") ||
          error.message?.includes("Refresh Token Not Found")
        ) {
          console.warn("Invalid refresh token detected, clearing auth state");
          await supabase.auth.signOut({ scope: "local" });
        }
        setUser(null);
        setIsAdmin(false);
        setUserEmail(null);
        return;
      }

      if (!authUser) {
        setUser(null);
        setIsAdmin(false);
        setUserEmail(null);
        return;
      }

      setUser(authUser);
      setUserEmail(authUser.email || null);
      await checkAdminStatus(authUser);
    } catch (error: any) {
      console.error("Error refreshing auth:", error);

      // Handle invalid refresh token errors
      if (
        error.message?.includes("Invalid Refresh Token") ||
        error.message?.includes("Refresh Token Not Found")
      ) {
        console.warn("Invalid refresh token detected, clearing auth state");
        await supabase.auth.signOut({ scope: "local" });
      }

      setUser(null);
      setIsAdmin(false);
      setUserEmail(null);
    }
  };

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;
    let subscription: any = null;
    let initTimeout: NodeJS.Timeout | null = null;

    // Initial auth check with timeout
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await refreshAuth();
      } catch (error) {
        console.error("Error during initial auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set a maximum timeout for initialization (10 seconds)
    initTimeout = setTimeout(() => {
      console.warn("Auth initialization timeout - forcing loading to false");
      setIsLoading(false);
    }, 10000);

    initAuth().then(() => {
      // Clear the timeout if init completes successfully
      if (initTimeout) {
        clearTimeout(initTimeout);
        initTimeout = null;
      }
    });

    // Set up session refresh (every 50 minutes) - only in browser
    if (typeof window !== "undefined") {
      refreshInterval = setInterval(
        async () => {
          try {
            // Check if we have a valid session before attempting refresh
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
              console.log("No active session, skipping auto-refresh");
              return;
            }

            console.log("Auto-refreshing session...");
            const { error } = await supabase.auth.refreshSession();

            if (error) {
              console.error("Session refresh failed:", error);

              // If refresh token is invalid, clear the session and stop trying
              if (
                error.message?.includes("Invalid Refresh Token") ||
                error.message?.includes("Refresh Token Not Found")
              ) {
                console.warn(
                  "Invalid refresh token detected, clearing session",
                );
                await supabase.auth.signOut();
                if (refreshInterval) {
                  clearInterval(refreshInterval);
                  refreshInterval = null;
                }
              }
            }
          } catch (error) {
            console.error("Error during session refresh:", error);
          }
        },
        50 * 60 * 1000,
      ); // 50 minutes
    }

    // Listen for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session?.user);

      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setIsAdmin(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setUserEmail(session.user.email || null);
        await checkAdminStatus(session.user);
      }

      setIsLoading(false);
    });

    subscription = authSubscription;

    return () => {
      subscription?.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []); // Empty dependency array to prevent infinite re-renders

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        userEmail,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
