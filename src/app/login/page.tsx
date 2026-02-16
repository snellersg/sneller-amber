'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  // Run database check on component mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkDatabaseSetup()
    }
  }, [])

  const validateEmailDomain = (email: string) => {
    const allowedDomains = ['@snellersg.com', '@snellerslandscaping.com']
    const normalizedEmail = email.toLowerCase().trim()
    return allowedDomains.some(domain => normalizedEmail.endsWith(domain))
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Za-z]/.test(password)) {
      return 'Password must contain at least one letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  // Diagnostic function to check database setup
  const checkDatabaseSetup = async () => {
    try {
      console.log('Checking database setup...')
      
      // Check if allowed_domains table exists and has data
      const { data: domains, error: domainsError } = await supabase
        .from('allowed_domains')
        .select('domain, is_active')
        .limit(5)
      
      console.log('Allowed domains check:', { domains, domainsError })
      
      // Check if users table exists
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      console.log('Users table check:', { usersError })
      
    } catch (error) {
      console.log('Database setup check failed:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Client-side validation
    const normalizedEmail = email.toLowerCase().trim()
    if (!validateEmailDomain(normalizedEmail)) {
      setError('Only @snellersg.com and @snellerslandscaping.com email addresses are allowed')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Enhanced password validation for signup
        const passwordError = validatePassword(password)
        if (passwordError) {
          setError(passwordError)
          setLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: '', // Ensure user_metadata is clean
            }
          }
        })

        if (signUpError) {
          // More specific error handling for common issues
          console.log('Full signup error details:', {
            message: signUpError.message,
            ...(signUpError.code && { code: signUpError.code }),
            ...(signUpError.status && { status: signUpError.status }),
            fullError: signUpError
          })
          
          const errorMessage = signUpError.message?.toLowerCase() || ''
          const errorCode = signUpError.code
          
          if (errorMessage.includes('domain') || 
              errorMessage.includes('not allowed') ||
              errorCode === '23503' || // foreign key violation
              errorCode === 'P0001') { // raised exception from trigger
            setError('Your email domain is not authorized for registration. Please contact brendon.dalaba@snellersg.com to add your domain.')
          } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
            setError('Database configuration incomplete. Please contact your administrator to complete the setup.')
          } else if (errorMessage.includes('function') && errorMessage.includes('does not exist')) {
            setError('Database configuration incomplete. Please contact your administrator to complete the setup.')
          } else if (errorMessage.includes('user already registered') || 
                     errorMessage.includes('already been registered')) {
            setError('This email address is already registered. Please try signing in instead.')
          } else if (errorMessage.includes('invalid email')) {
            setError('Please enter a valid email address.')
          } else if (errorMessage.includes('weak password') || errorMessage.includes('password')) {
            setError('Password is too weak. Please choose a stronger password with at least 8 characters.')
          } else if (errorMessage.includes('database error saving') || 
                     errorMessage.includes('saving new user') ||
                     (errorMessage.includes('database') && errorMessage.includes('error'))) {
            setError('Database configuration issue detected. This might be a temporary problem or require administrator setup. Please try again in a moment or contact brendon.dalaba@snellersg.com.')
          } else {
            setError(`Signup failed: ${signUpError.message || 'Please try again or contact support.'} (Error code: ${errorCode || 'unknown'})`)
          }
          setLoading(false)
          return
        }

        setMessage('Check your email for the confirmation link!')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (signInError) throw signInError

        // Successful login - redirect to sheets and docs
        router.push('/sheets-and-docs')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!validateEmailDomain(email)) {
      setError('Please enter a valid company email address')
      setLoading(false)
      return
    }

    try {
      const normalizedEmail = email.toLowerCase().trim()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      setMessage('Password reset email sent! Check your inbox.')
      setShowForgotPassword(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg border border-border">
        {/* Logo / Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo512.png"
              alt="Amber Logo"
              className="h-16 w-16"
            />
          </div>
          <h2 className="text-3xl font-bold">AMBER</h2>
          <p className="mt-2 text-muted-foreground">
            {showForgotPassword
              ? 'Reset your password'
              : isSignUp
              ? 'Create your account'
              : 'Sign in to your account'}
          </p>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@snellersg.com"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-primary bg-secondary dark:bg-secondary/20 p-3 rounded-md">
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@snellersg.com"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Must end with @snellersg.com or @snellerslandscaping.com
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <div className="mt-1 text-xs space-y-1">
                    <p className="text-muted-foreground">Password requirements:</p>
                    <div className="space-y-0.5 text-xs">
                      <div className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span>At least one letter</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span>At least one number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me (Sign In Only) */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      style={{ accentColor: 'hsl(var(--primary))' }}
                    />
                    <span className="text-sm">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
                {error.includes('domain') && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Authorized domains:</p>
                    <ul className="list-disc ml-4 text-blue-700 dark:text-blue-200 text-xs space-y-1">
                      <li>@snellersg.com</li>
                      <li>@snellerslandscaping.com</li>
                    </ul>
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">Need your domain added? Contact: <span className="font-mono">brendon.dalaba@snellersg.com</span></p>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {isSignUp ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </span>
              )}
            </Button>

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setMessage('')
                }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
