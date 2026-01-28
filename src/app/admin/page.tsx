'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { Users, Shield, RefreshCw, Loader2, Plus, Trash2, Crown, CheckCircle } from 'lucide-react'

// Add viewport meta for fixed mobile experience
if (typeof window !== 'undefined') {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  } else {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(meta)
  }
}

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in_at: string
  status?: string
  role?: string
}

interface AuditLog {
  id: string
  action: string
  user_email?: string
  user_id?: string
  target_user_email?: string
  details?: any
  created_at: string
}

interface AllowedDomain {
  id: string
  domain: string
  notes?: string
  added_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'domains'>('users')
  const [newDomain, setNewDomain] = useState('')
  const [domainNotes, setDomainNotes] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Fetch all users from the new consolidated users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error fetching users:', usersError.message)
        return
      }

      if (!usersData || usersData.length === 0) {
        // If users table is empty, create default admin user
        const defaultUsers = [{
          id: 'brendon.dalaba@snellersg.com',
          email: 'brendon.dalaba@snellersg.com',
          full_name: 'Brendon Dalaba',
          created_at: new Date().toISOString(),
          last_sign_in_at: 'Never',
          status: 'active' as string,
          role: 'admin' as string
        }]
        
        setUsers(defaultUsers)
        return
      }

      // Map users with basic data
      const usersWithActivity = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email.split('@')[0] || 'Unknown',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || 'Never',
        status: user.status || 'active',
        role: user.role || 'user'
      })) || []

      setUsers(usersWithActivity)
      
    } catch (error) {
      console.error('Error in fetchUsers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllowedDomains = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('added_at', { ascending: false })

      if (error) {
        console.error('Error fetching allowed domains:', error)
        return
      }

      setAllowedDomains(data || [])
    } catch (error) {
      console.error('Error in fetchAllowedDomains:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .insert({
          domain: newDomain.toLowerCase().trim(),
          notes: domainNotes.trim() || null
        })

      if (error) {
        console.error('Error adding domain:', error)
        return
      }

      setNewDomain('')
      setDomainNotes('')
      fetchAllowedDomains()
    } catch (error) {
      console.error('Error in addDomain:', error)
    }
  }

  const removeDomain = async (id: string, domain: string) => {
    if (!confirm(`Remove domain "${domain}"?`)) return

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error removing domain:', error)
        return
      }

      fetchAllowedDomains()
    } catch (error) {
      console.error('Error in removeDomain:', error)
    }
  }

  // Admin action functions
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'promote' : 'demote'
    
    if (!confirm(`${action} this user to ${newRole}?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      // Log the action
      await supabase
        .from('admin_audit_log_backup')
        .insert({
          action: `${action}_user`,
          user_id: userId,
          admin_user_id: 'brendon.dalaba@snellersg.com', // Current admin
          details: `User role changed from ${currentRole} to ${newRole}`
        })

      fetchUsers()
    } catch (error) {
      console.error('Error in toggleUserRole:', error)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'active' ? 'approve' : 'suspend'
    
    if (!confirm(`${action} this user?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user status:', error)
        return
      }

      // Log the action
      await supabase
        .from('admin_audit_log_backup')
        .insert({
          action: `${action}_user`,
          user_id: userId,
          admin_user_id: 'brendon.dalaba@snellersg.com', // Current admin
          details: `User status changed from ${currentStatus} to ${newStatus}`
        })

      fetchUsers()
    } catch (error) {
      console.error('Error in toggleUserStatus:', error)
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Permanently delete user "${userEmail}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return
      }

      // Log the action
      await supabase
        .from('admin_audit_log_backup')
        .insert({
          action: 'delete_user',
          user_id: userId,
          admin_user_id: 'brendon.dalaba@snellersg.com', // Current admin
          details: `User ${userEmail} permanently deleted`
        })

      fetchUsers()
    } catch (error) {
      console.error('Error in deleteUser:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'domains') {
      fetchAllowedDomains()
    }
  }, [activeTab])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (activeTab === 'users') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Registered Users
            </h2>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="-mx-6 px-6">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"
                       style={{minWidth: '600px'}}>
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        User
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
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-primary/10 text-primary border border-primary/30' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role === 'admin' && (
                              <Crown className="w-3 h-3 mr-1" />
                            )}
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">{new Date(user.created_at).toLocaleDateString()}</span>
                          <span className="sm:hidden">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">
                            {user.last_sign_in_at && user.last_sign_in_at !== 'Never'
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : 'Never'
                            }
                          </span>
                          <span className="sm:hidden">
                            {user.last_sign_in_at && user.last_sign_in_at !== 'Never'
                              ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Never'
                            }
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Conditional Action Buttons based on user status */}
                            {user.status === 'pending' ? (
                              /* Approve Button for pending users */
                              <button
                                onClick={() => toggleUserStatus(user.id, user.status || 'pending')}
                                className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
                                title="Approve User"
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              /* Suspend Button for active users */
                              <button
                                onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                                className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                                title="Suspend User"
                              >
                                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                            
                            {/* Role Toggle Button */}
                            {user.role === 'admin' ? (
                              /* Demote Button */
                              <button
                                onClick={() => toggleUserRole(user.id, user.role || 'admin')}
                                className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                title="Demote to User"
                              >
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              /* Promote Button */
                              <button
                                onClick={() => toggleUserRole(user.id, user.role || 'user')}
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
        )
      }

    if (activeTab === 'domains') {
      return (
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Allowed Domains
            </h2>
            <button
              onClick={fetchAllowedDomains}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
              Add New Domain
            </h3>
            <form onSubmit={addDomain} className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
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
              <p className="text-gray-500 dark:text-gray-400">No allowed domains configured</p>
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
                    <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {domain.domain}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {domain.notes || '-'}
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
      )
    }

    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Manage users and configure access controls
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-8">
            <nav className="-mb-px flex space-x-4 sm:space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
                onClick={() => setActiveTab('domains')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'domains'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Allowed Domains</span>
                  <span className="sm:hidden">Domains</span>
                  <span className="hidden sm:inline">({allowedDomains.length})</span>
                  <span className="sm:hidden">({allowedDomains.length})</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {renderContent()}
          </div>
        </div>
    </Layout>
  )
}
