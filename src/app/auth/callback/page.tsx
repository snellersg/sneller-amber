"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Type definitions
interface Admin {
  id?: string;
  email: string;
  role?: string;
}

// Helper function to notify admins of new user registration
const notifyAdmins = async (newUser: User, supabase: SupabaseClient) => {
  try {
    // Get all admin users
    const {
      data: admins,
      error: adminError,
    }: { data: Admin[] | null; error: PostgrestError | null } = await supabase
      .from("users")
      .select("email")
      .eq("role", "admin");

    if (adminError) {
      console.error("Error fetching admin users:", adminError);
      return;
    }

    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify");
      return;
    }

    // For now, we'll log the notification
    // In production, you might want to send emails or create in-app notifications
    console.log("🚨 NEW USER REGISTRATION ALERT 🚨");
    console.log("New user registered:", {
      email: newUser.email,
      id: newUser.id,
      created_at: new Date().toISOString(),
    });
    console.log(
      "Admins to notify:",
      admins.map((admin: Admin) => admin.email),
    );
    console.log("👆 Please review and approve this user in the admin panel");

    // TODO: Implement actual notification system (email, in-app notifications, etc.)
    // Example: await sendEmailNotification(admins, newUser)
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

// Helper function to ensure user record exists in database
const ensureUserRecord = async (authUser: User, supabase: SupabaseClient) => {
  try {
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking user record:", existingError);
      return false;
    }

    if (existing) {
      console.log("User record already exists for:", authUser.email);
      return true;
    }

    const payload = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || "",
      role: "user",
    };

    const { error: insertError } = await supabase.from("users").insert(payload);

    if (insertError) {
      if (insertError.code === "23505") {
        // Duplicate key error - user already exists
        console.log(
          "User record already exists (duplicate key):",
          authUser.email,
        );
        return true;
      }
      console.error("Error creating user record:", insertError);
      return false;
    }

    console.log("User record created successfully for:", authUser.email);

    // Notify admins of new user registration
    await notifyAdmins(authUser, supabase);
    return true;
  } catch (error) {
    console.error("Unexpected error in ensureUserRecord:", error);
    return false;
  }
};

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { supabase } = await import("@/lib/supabase");

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Auth callback error:", error);
            setStatus("error");
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          // Ensure user record exists in database after successful auth
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              const success = await ensureUserRecord(user, supabase);
              if (!success) {
                console.warn(
                  "Warning: Could not create user database record. User can still proceed.",
                );
                // Don't block the auth flow - user can still access the app
              }
            }
          } catch (userErr) {
            console.warn("Warning: Could not create user record:", userErr);
            // Don't block login for this error - user can still proceed
          }
        }

        setStatus("success");
        router.push("/sheets-and-docs");
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-4 py-8 bg-white shadow dark:bg-gray-800 sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Authentication Error
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Authentication failed. Please try again.
              </p>
              <p className="text-xs text-gray-400">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow dark:bg-gray-800 sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Confirming your email...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait while we complete your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
