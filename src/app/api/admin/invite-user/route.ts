import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Create admin client with service role key (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Generate cryptographically secure password
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const specials = "!@#$%&*";
  let password = "";

  // 12 random characters
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length));
  }

  // Add 2 special characters
  password += specials.charAt(crypto.randomInt(specials.length));
  password += specials.charAt(crypto.randomInt(specials.length));

  // Add 2 numbers
  password += crypto.randomInt(10).toString();
  password += crypto.randomInt(10).toString();

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    const { email, role = "user" } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 },
      );
    }

    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Verify the requesting user is authenticated and admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token and get the requesting user
    const {
      data: { user: requestingUser },
      error: tokenError,
    } = await supabaseAdmin.auth.getUser(token);

    if (tokenError || !requestingUser) {
      return NextResponse.json(
        { error: "Invalid authorization" },
        { status: 401 },
      );
    }

    // Check if requesting user is admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", requestingUser.email)
      .single();

    if (adminError || adminCheck?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tempPassword = generateSecurePassword();

    // Check for and clean up any orphaned profiles before creating auth user
    console.log(`Checking for existing profile with email: ${normalizedEmail}`);
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      console.log(`Found existing profile with ID: ${existingProfile.id}, cleaning up...`);
      
      // Check if this profile has a corresponding auth user
      try {
        const { data: authCheck, error: authCheckError } = await supabaseAdmin.auth.admin.getUserById(existingProfile.id);
        
        if (authCheckError) {
          // Profile exists but no corresponding auth user - this is an orphaned profile
          console.log("Orphaned profile detected (no auth user), deleting profile...");
          const { error: deleteError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", existingProfile.id);
          
          if (deleteError) {
            console.error("Failed to delete orphaned profile:", deleteError);
            return NextResponse.json(
              { error: `Failed to clean up existing data for ${normalizedEmail}. Please contact support.` },
              { status: 500 }
            );
          }
          console.log("Orphaned profile deleted successfully");
        } else {
          // Both profile and auth user exist - user actually exists
          console.log("User already exists with both auth and profile records");
          return NextResponse.json(
            { error: `User ${normalizedEmail} already exists and can log in. Use password reset if needed.` },
            { status: 400 }
          );
        }
      } catch (authCheckError) {
        // Error checking auth - assume it's orphaned and delete
        console.log("Error checking auth user, treating as orphaned profile");
        const { error: deleteError } = await supabaseAdmin
          .from("users")
          .delete()
          .eq("id", existingProfile.id);
        
        if (deleteError) {
          console.error("Failed to delete potentially orphaned profile:", deleteError);
          return NextResponse.json(
            { error: `Failed to clean up existing data for ${normalizedEmail}. Please contact support.` },
            { status: 500 }
          );
        }
        console.log("Potentially orphaned profile deleted");
      }
    }

    // Check for any auth users with this email (without corresponding profile)
    console.log(`Checking for existing auth user with email: ${normalizedEmail}`);
    try {
      const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = allUsers.users?.find(user => user.email === normalizedEmail);
      
      if (existingAuthUser) {
        console.log(`Found existing auth user with ID: ${existingAuthUser.id}`);
        
        // Check if this auth user has a profile
        const { data: authProfile, error: authProfileError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("id", existingAuthUser.id)
          .maybeSingle();
        
        if (!authProfile) {
          // Auth user exists but no profile - create the profile
          console.log("Auth user exists without profile, creating profile...");
          const { error: profileError } = await supabaseAdmin
            .from("users")
            .insert({
              id: existingAuthUser.id,
              email: existingAuthUser.email,
              full_name: existingAuthUser.email?.split("@")[0] || "New User",
              role: role,
              created_at: new Date().toISOString(),
              last_sign_in_at: null,
            });
          
          if (profileError) {
            console.error("Failed to create profile for existing auth user:", profileError);
            return NextResponse.json(
              { error: `Failed to complete user setup for ${normalizedEmail}. Please contact support.` },
              { status: 500 }
            );
          }
          
          // Update the user's password
          const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
            existingAuthUser.id,
            { password: tempPassword }
          );
          
          if (passwordError) {
            console.error("Failed to set password for existing auth user:", passwordError);
            return NextResponse.json(
              { error: `User setup completed but failed to set password. Please use password reset.` },
              { status: 500 }
            );
          }
          
          return NextResponse.json({
            success: true,
            user: {
              id: existingAuthUser.id,
              email: existingAuthUser.email,
              tempPassword: tempPassword,
            },
          });
        } else {
          // Both auth user and profile exist
          console.log("Complete user already exists");
          return NextResponse.json(
            { error: `User ${normalizedEmail} already exists and can log in. Use password reset if needed.` },
            { status: 400 }
          );
        }
      }
    } catch (authListError) {
      console.error("Error checking existing auth users:", authListError);
      // Continue with creation - this is just a safety check
    }

    // Check if the email domain is in allowed domains (diagnostic)
    const emailDomain = "@" + normalizedEmail.split("@")[1];
    console.log(`Attempting to create user for domain: ${emailDomain}`);

    try {
      const { data: domainCheck, error: domainError } = await supabaseAdmin
        .from("allowed_domains")
        .select("domain")
        .eq("domain", emailDomain)
        .single();

      if (domainError || !domainCheck) {
        console.log(
          `Domain ${emailDomain} not found in allowed_domains table. Adding it...`,
        );
        // Try to add the domain automatically
        const { error: addDomainError } = await supabaseAdmin
          .from("allowed_domains")
          .insert({
            domain: emailDomain,
            notes: `Auto-added for admin invite: ${normalizedEmail}`,
          });

        if (addDomainError) {
          console.error("Failed to auto-add domain:", addDomainError);
          return NextResponse.json(
            {
              error: `Domain ${emailDomain} not allowed. Please add it to allowed domains first.`,
            },
            { status: 400 },
          );
        }
      }
    } catch (domainCheckError) {
      console.error("Error checking domain:", domainCheckError);
    }

    // Create the user in Supabase Auth using admin client
    const { data: authData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true, // Auto-confirm the email
      });

    if (createUserError) {
      console.error("Auth user creation failed:", createUserError.message);
      return NextResponse.json(
        {
          error: `Failed to create user: ${createUserError.message}`,
        },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error: "User creation failed: No user data returned",
        },
        { status: 500 },
      );
    }

    // Create the user profile record
    console.log(
      `Creating profile for user: ${authData.user.id}, email: ${authData.user.email}`,
    );

    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      full_name: authData.user.email?.split("@")[0] || "New User",
      role: role,
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
    };

    console.log("Profile data to insert:", profileData);

    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert(profileData);

    if (profileError) {
      console.error("Profile creation failed - Full error details:", {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      });

      // Clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log("Successfully cleaned up auth user after profile failure");
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }

      // Provide more specific error message based on the error type
      let userMessage = `Failed to create user profile: ${profileError.message}`;

      if (profileError.code === "23505") {
        userMessage = "User already exists with this email or ID";
      } else if (
        profileError.message.includes("permission") ||
        profileError.message.includes("policy")
      ) {
        userMessage = `Database permission denied. Email domain "${emailDomain}" may not be authorized.`;
      } else if (
        profileError.message.includes("domain") ||
        profileError.message.includes("email")
      ) {
        userMessage = `Email domain validation failed for "${emailDomain}". Please ensure the domain is properly configured.`;
      }

      return NextResponse.json(
        {
          error: userMessage,
          details:
            process.env.NODE_ENV === "development" ? profileError : undefined,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        tempPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("Unexpected error in invite-user API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
