"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import {
  Users,
  Shield,
  Loader2,
  Plus,
  Trash2,
  Crown,
  CheckCircle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  status?: string; // Calculated from auth data, not stored in DB
  role?: string;
}

interface AllowedDomain {
  id: string;
  domain: string;
  notes?: string;
  added_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "domains">("users");
  const [newDomain, setNewDomain] = useState("");
  const [domainNotes, setDomainNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Invitation state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  // Check if current user is admin before allowing access
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Auth error:", authError);
          setIsAdmin(false);
          setUserEmail(null);
          setAuthLoading(false);
          return;
        }

        setUserEmail(user.email || null);

        // Check if user is admin from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

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
        console.error("Error in checkAdminStatus:", error);
        setIsAdmin(false);
        setUserEmail(null);
      } finally {
        setAuthLoading(false);
      }
    };

    // Initial check
    checkAdminStatus();

    // Listen for auth state changes to handle session expiration/refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Admin page - Auth state change:", event, !!session?.user);

      if (event === "SIGNED_OUT" || !session?.user) {
        setIsAdmin(false);
        setUserEmail(null);
        setAuthLoading(false);
        return;
      }

      if (
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {
        // Re-check admin status when session is refreshed or user signs in
        setUserEmail(session.user.email || null);

        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          // Only process real errors (not empty objects)
          const hasRealError = userError && typeof userError === 'object' && 
            (userError.message || userError.code || userError.details);
          
          if (hasRealError) {
            console.error(
              "Error checking admin status on session refresh:",
              userError,
            );
            setIsAdmin(false);
          } else if (userData?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error in session refresh admin check:", error);
          setIsAdmin(false);
        } finally {
          setAuthLoading(false);
        }
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  const fetchUsers = async () => {
    if (!isAdmin) {
      console.log('[fetchUsers] Skipping - user is not admin');
      return;
    }

    setLoading(true);
    try {
      // Get auth session for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[fetchUsers] No session available');
        setLoading(false);
        return;
      }

      console.log('[fetchUsers] Fetching users from API...');

      // Fetch users from API route (uses service role key to bypass RLS)
      const response = await fetch('/api/admin/get-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[fetchUsers] API error:', error);
        setLoading(false);
        return;
      }

      const { users: usersData } = await response.json();
      console.log('[fetchUsers] Received', usersData?.length || 0, 'users from API');

      // Get current user's auth data to check their verification status
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // Map users with email verification status
      const usersWithStatus =
        usersData?.map((user: any) => {
          const isCurrentUser = currentUser && user.email === currentUser.email;
          let emailVerified = true;

          if (isCurrentUser) {
            emailVerified = !!currentUser.email_confirmed_at;
          }

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name || user.email.split("@")[0] || "Unknown",
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at || "Never",
            status: emailVerified ? "verified" : "pending",
            role: user.role || "user",
          };
        }) || [];

      console.log('[fetchUsers] Setting', usersWithStatus.length, 'users to state');
      setUsers(usersWithStatus);
    } catch (error) {
      console.error("[fetchUsers] Exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedDomains = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("allowed_domains")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) {
        console.error("Error fetching allowed domains:", error);
        return;
      }

      const domains = data || [];

      // Check if required domains exist (with @ prefix)
      const requiredDomains = ["@snellersg.com", "@snellerslandscaping.com"];
      const existingDomains = domains.map((d) => d.domain);
      const missingDomains = requiredDomains.filter(
        (domain) => !existingDomains.includes(domain),
      );

      if (missingDomains.length > 0) {
        console.log("Missing required domains, adding:", missingDomains);
        await ensureRequiredDomains(missingDomains);
        // Refetch after adding missing domains
        const { data: updatedData } = await supabase
          .from("allowed_domains")
          .select("*")
          .order("added_at", { ascending: false });
        setAllowedDomains(updatedData || []);
      } else {
        setAllowedDomains(domains);
      }

      // Bootstrap default domains if none exist
      if (domains.length === 0) {
        await bootstrapDefaultDomains();
      }
    } catch (error) {
      console.error("Error in fetchAllowedDomains:", error);
    } finally {
      setLoading(false);
    }
  };

  const ensureRequiredDomains = async (missingDomains: string[]) => {
    const domainData = missingDomains.map((domain) => ({
      domain,
      notes:
        domain === "@snellersg.com"
          ? "Primary company domain"
          : "Legacy landscaping division domain",
    }));

    try {
      for (const data of domainData) {
        const { error } = await supabase.from("allowed_domains").insert(data);

        if (error && error.code !== "23505") {
          console.error("Error ensuring domain:", data.domain, error);
        } else {
          console.log("Successfully ensured domain:", data.domain);
        }
      }
    } catch (error) {
      console.error("Error in ensureRequiredDomains:", error);
    }
  };

  const bootstrapDefaultDomains = async () => {
    const defaultDomains = [
      { domain: "@snellersg.com", notes: "Primary company domain" },
      {
        domain: "@snellerslandscaping.com",
        notes: "Legacy landscaping division domain",
      },
    ];

    try {
      for (const domainData of defaultDomains) {
        const { error } = await supabase
          .from("allowed_domains")
          .insert(domainData);

        if (error && error.code !== "23505") {
          // Ignore duplicate key errors
          console.error(
            "Error adding default domain:",
            domainData.domain,
            error,
          );
        }
      }

      // Refresh the list after adding defaults
      const { data } = await supabase
        .from("allowed_domains")
        .select("*")
        .order("added_at", { ascending: false });

      setAllowedDomains(data || []);
    } catch (error) {
      console.error("Error bootstrapping default domains:", error);
    }
  };

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      // Ensure domain has @ prefix for consistency
      let formattedDomain = newDomain.toLowerCase().trim();
      if (!formattedDomain.startsWith("@")) {
        formattedDomain = "@" + formattedDomain;
      }

      const { error } = await supabase.from("allowed_domains").insert({
        domain: formattedDomain,
        notes: domainNotes.trim() || null,
      });

      if (error) {
        console.error("Error adding domain:", error);
        return;
      }

      setNewDomain("");
      setDomainNotes("");
      fetchAllowedDomains();
    } catch (error) {
      console.error("Error in addDomain:", error);
    }
  };

  const removeDomain = async (id: string, domain: string) => {
    if (!confirm(`Remove domain "${domain}"?`)) return;

    try {
      const { error } = await supabase
        .from("allowed_domains")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error removing domain:", error);
        return;
      }

      fetchAllowedDomains();
    } catch (error) {
      console.error("Error in removeDomain:", error);
    }
  };

  // Admin action functions
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "promote" : "demote";

    if (!confirm(`${action} this user to ${newRole}?`)) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user role:", error);
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error("Error in toggleUserRole:", error);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(`Permanently delete user "${userEmail}"? This cannot be undone.`)
    )
      return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        console.error("Error deleting user:", error);
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error("Error in deleteUser:", error);
    }
  };



  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteMessage("");

    try {
      // Get current user's session token for admin verification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setInviteMessage("You must be logged in to invite users.");
        return;
      }

      // Call the API route to create the user
      const response = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Only log if there's actual error content
        if (result && (result.error || result.details)) {
          console.error("Invite user failed:", result.error || result.details);
        }
        setInviteMessage(
          `Failed to create user: ${result.error || "Unknown error"}`,
        );
        return;
      }

      if (result.success && result.user) {
        setInviteMessage(
          `✅ User invited successfully! Credentials:\n\nEmail: ${result.user.email}\nPassword: ${result.user.tempPassword}\n\n⚠️ Share these credentials securely and ask them to change the password immediately.`,
        );
        setInviteEmail("");
        setInviteRole("user");
        fetchUsers();
      } else {
        setInviteMessage(
          "Failed to create user: Invalid response from server.",
        );
      }
    } catch (error) {
      console.error("Error in inviteUser:", error);
      setInviteMessage("Failed to invite user. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if user is confirmed admin
    if (isAdmin && !authLoading) {
      fetchUsers();
      fetchAllowedDomains();
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (!isAdmin || authLoading) return;

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "domains") {
      fetchAllowedDomains();
    }
  }, [activeTab, isAdmin, authLoading]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (activeTab === "users") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              REGISTERED USERS
            </h2>
          </div>

          {/* User Invitation Form */}
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Invite New User
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Add new team members to the platform
              </p>
            </div>

            <form onSubmit={inviteUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="inviteEmail"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@snellersg.com"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="inviteRole"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Role
                  </label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "user" | "admin")
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-end md:col-span-2 xl:col-span-1">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full btn-sneller inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {inviteLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {inviteMessage && (
                <div
                  className={`p-4 rounded-lg text-sm whitespace-pre-line ${
                    inviteMessage.includes("✅")
                      ? "status-success"
                      : "status-error"
                  }`}
                >
                  {inviteMessage}
                </div>
              )}
            </form>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="-mx-6 px-6">
              <div className="overflow-x-auto max-w-full">
                <table
                  className="w-full divide-y divide-gray-200 dark:divide-gray-700"
                  style={{ minWidth: "600px" }}
                >
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Role
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Joined
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Last Sign In
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                          <div className="flex flex-col min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {user.full_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 truncate text-xs">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "verified"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                            }`}
                          >
                            {user.status === "verified" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {user.status === "verified"
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {user.role === "admin" && (
                              <Crown className="w-3 h-3 mr-1" />
                            )}
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                          <span className="sm:hidden">
                            {new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">
                            {user.last_sign_in_at &&
                            user.last_sign_in_at !== "Never"
                              ? new Date(
                                  user.last_sign_in_at,
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                          <span className="sm:hidden">
                            {user.last_sign_in_at &&
                            user.last_sign_in_at !== "Never"
                              ? new Date(
                                  user.last_sign_in_at,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Never"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Role Toggle Button */}
                            {user.role === "admin" ? (
                              /* Demote Button */
                              <button
                                onClick={() =>
                                  toggleUserRole(user.id, user.role || "admin")
                                }
                                className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                title="Demote to User"
                              >
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              /* Promote Button */
                              <button
                                onClick={() =>
                                  toggleUserRole(user.id, user.role || "user")
                                }
                                className="inline-flex items-center p-2 rounded-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                                title="Promote to Admin"
                              >
                                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}

                            {/* Delete User Button */}
                            <button
                              onClick={() => deleteUser(user.id, user.email)}
                              className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "domains") {
      return (
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Allowed Domains
            </h2>

          </div>

          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white uppercase mb-2 sm:mb-3">
              Add New Domain
            </h3>
            <form
              onSubmit={addDomain}
              className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4"
            >
              <div className="flex-1">
                <input
                  placeholder="@example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  placeholder="Organization or purpose (optional)"
                  value={domainNotes}
                  onChange={(e) => setDomainNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Domain
              </button>
            </form>
          </div>

          {allowedDomains.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No allowed domains configured
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allowedDomains.map((domain) => (
                    <tr
                      key={domain.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {domain.domain}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {domain.notes || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(domain.added_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeDomain(domain.id, domain.domain)}
                          className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove Domain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {authLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Checking permissions...
            </span>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              You don't have permission to access the admin panel.
            </p>
            {userEmail && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Signed in as: {userEmail}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white uppercase">
                ADMIN PANEL
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Manage users and configure access controls
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-8">
              <nav className="-mb-px flex space-x-4 sm:space-x-8">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === "users"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Users</span>
                    <span className="sm:hidden">({users.length})</span>
                    <span className="hidden sm:inline">({users.length})</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("domains")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === "domains"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Allowed Domains</span>
                    <span className="sm:hidden">Domains</span>
                    <span className="hidden sm:inline">
                      ({allowedDomains.length})
                    </span>
                    <span className="sm:hidden">({allowedDomains.length})</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {renderContent()}
            </div>
          </>
        )}
      </div>


    </Layout>
  );
}
