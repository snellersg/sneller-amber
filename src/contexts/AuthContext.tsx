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

  const updateLastSignIn = async (authUser: User) => {
    try {
      // Update last_sign_in_at timestamp silently
      const { error } = await supabase
        .from("users")
        .update({ 
          last_sign_in_at: new Date().toISOString()
        })
        .eq("id", authUser.id);
      
      if (error) {
        // Silent failure - don't disrupt user experience
        console.log("Could not update last sign in:", error.message);
      }
    } catch (error) {
      // Silent failure
      console.log("Error updating last sign in:", error);
    }
  };

  const refreshAuth = async () => {
    try {
      // Add timeout to prevent hanging on auth check - simplified timeout handling
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          reject(new Error("Auth refresh timeout"));
        }, 15000) // 15 second timeout
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
        console.log("Auth refresh error (preserving current state):", error.message);
        // Don't clear state on timeout - just log and continue
        if (error.message !== "Auth refresh timeout") {
          setUser(null);
          setIsAdmin(false);
          setUserEmail(null);
        }
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
      // Handle different types of errors appropriately
      if (error.message === "Auth refresh timeout") {
        console.log("Auth refresh timed out, preserving current state");
        // Don't clear auth state on timeout - just continue with current state
        return;
      }
      
      if (
        error.message?.includes("Invalid Refresh Token") ||
        error.message?.includes("Refresh Token Not Found")
      ) {
        console.warn("Invalid refresh token detected, clearing auth state");
        await supabase.auth.signOut({ scope: "local" });
        setUser(null);
        setIsAdmin(false);
        setUserEmail(null);
      } else {
        // For other errors (network issues, etc.), just log and preserve state
        console.log("Auth refresh error (preserving current state):", error.message);
      }
    }
  };

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;
    let subscription: any = null;
    let initTimeout: NodeJS.Timeout | null = null;

    // Simplified initialization - no complex auth checking
    const initAuth = async () => {
      console.log("Starting auth initialization...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Got session:", !!session?.user);
        
        if (session?.user) {
          setUser(session.user);
          setUserEmail(session.user.email || null);
          // Check admin status in background - don't await
          checkAdminStatus(session.user);
        } else {
          setUser(null);
          setUserEmail(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        setUser(null);
        setUserEmail(null);
        setIsAdmin(false);
      } finally {
        console.log("Setting loading to false");
        setIsLoading(false);
      }
    };

    // Emergency timeout - 5 seconds max
    initTimeout = setTimeout(() => {
      console.warn("EMERGENCY: Auth timeout - forcing loading off");
      setIsLoading(false);
    }, 5000);

    // Start initialization
    initAuth().finally(() => {
      if (initTimeout) {
        clearTimeout(initTimeout);
        initTimeout = null;
      }
    });

    // Set up session refresh (every 30 minutes) - only in browser
    // More frequent refresh to prevent session timeouts causing hangs
    if (typeof window !== "undefined") {
      refreshInterval = setInterval(
        async () => {
          try {
            // Check if we have a valid session before attempting refresh
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
              console.error("Error getting session:", sessionError);
              return;
            }

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
                error.message?.includes("Refresh Token Not Found") ||
                error.message?.includes("refresh_token_not_found")
              ) {
                console.warn(
                  "Invalid refresh token detected, clearing session",
                );
                await supabase.auth.signOut({ scope: "local" });
                if (refreshInterval) {
                  clearInterval(refreshInterval);
                  refreshInterval = null;
                }
              }
            } else {
              console.log("Session refreshed successfully");
            }
          } catch (error) {
            console.error("Error during session refresh:", error);
          }
        },
        30 * 60 * 1000,
      ); // 30 minutes - more frequent to prevent timeouts
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
        
        // CRITICAL: Set loading to false IMMEDIATELY so UI can render
        setIsLoading(false);
        
        // Check admin status in background (don't block UI)
        checkAdminStatus(session.user);
        
        // Update last sign in for SIGNED_IN events (not TOKEN_REFRESHED or INITIAL_SESSION)
        if (event === "SIGNED_IN") {
          updateLastSignIn(session.user);
        }
      }
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
