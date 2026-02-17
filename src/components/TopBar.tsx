"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Menu, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface TopBarProps {
  onSidebarToggle: () => void;
}

export default function TopBar({ onSidebarToggle }: TopBarProps) {
  const router = useRouter();
  const { user, userEmail } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Ensure theme is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // Once user clicks, switch between light and dark (override system)
    if (theme === "light" || theme === "system") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-5 w-5" />;

    // Show opposite of current effective theme (what clicking will do)
    const effectiveTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    return effectiveTheme === "dark" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );
  };

  const getThemeLabel = () => {
    if (!mounted) return "Toggle theme";

    // Show what clicking will do based on current effective theme
    const effectiveTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    return effectiveTheme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <img src="/logo512.png" alt="Sneller Logo" className="w-8 h-8" />
            <span className="text-xl font-heading font-bold text-foreground">
              AMBER
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle - cycles through light -> dark -> system */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            title={getThemeLabel()}
            aria-label={getThemeLabel()}
          >
            {getThemeIcon()}
          </button>

          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                title="My Profile"
              >
                <UserIcon className="h-5 w-5" />
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
