'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Users,
  Shield,
  ShieldOff,
  Trash2,
  Mail,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  Plus,
  Activity,
  Globe,
  Check,
  XCircle,
  Loader2,
} from 'lucide-react'

export default function AdminPanel() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allowedDomains, setAllowedDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Domain management state
  const [newDomain, setNewDomain] = useState('')
  const [domainNotes, setDomainNotes] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
        
        // TODO: Check if user is admin - for now, we'll assume they are if they can access this page
        // In a real implementation, you'd check user.user_metadata.isAdmin or a role system
        
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return

    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'logs') {
      fetchAuditLogs()
    } else if (activeTab === 'domains') {
      fetchAllowedDomains()
    }
  }, [activeTab, user])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      // Use RPC function to get all user data (including auth metadata)
      const { data, error: fetchError } = await supabase.rpc('admin_get_all_users')

      if (fetchError) {
        console.error('Error fetching users:', fetchError)
        throw fetchError
      }

      setUsers(data || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to fetch users. Make sure you have run the supabase_admin_get_users.sql script.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (fetchError) {
        console.error('Audit log fetch error:', fetchError)
        throw fetchError
      }

      setAuditLogs(data || [])
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err)
      setError(err.message || 'Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllowedDomains = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('added_at', { ascending: false })

      if (fetchError) {
        console.error('Domain fetch error:', fetchError)
        throw fetchError
      }

      setAllowedDomains(data || [])
    } catch (err: any) {
      console.error('Failed to fetch allowed domains:', err)
      setError(err.message || 'Failed to fetch allowed domains')
    } finally {
      setLoading(false)
    }
  }

  const logAdminAction = async (action: string, targetUserId?: string, targetUserEmail?: string, metadata?: any) => {
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: user?.id,
          admin_user_email: user?.email,
          action,
          target_user_id: targetUserId,
          target_user_email: targetUserEmail,
          metadata
        })
    } catch (err) {
      console.error('Failed to log admin action:', err)
    }
  }

  const toggleUserAdmin = async (userId: string, userEmail: string, currentlyAdmin: boolean) => {
    try {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { isAdmin: !currentlyAdmin } }
      )

      if (updateError) throw updateError

      await logAdminAction(
        currentlyAdmin ? 'user_demoted' : 'user_promoted',
        userId,
        userEmail,
        { previous_admin: currentlyAdmin, new_admin: !currentlyAdmin }
      )

      setMessage(`User ${currentlyAdmin ? 'demoted from' : 'promoted to'} admin successfully`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user admin status')
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This cannot be undone.`)) {
      return
    }

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

      if (deleteError) throw deleteError

      await logAdminAction('user_deleted', userId, userEmail)

      setMessage(`User ${userEmail} deleted successfully`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const sendPasswordReset = async (userEmail: string) => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(userEmail)

      if (resetError) throw resetError

      await logAdminAction('password_reset_sent', undefined, userEmail)

      setMessage(`Password reset email sent to ${userEmail}`)
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset')
    }
  }

  const approveUser = async (userId: string, userEmail: string) => {
    try {
      const { error: approveError } = await supabase.rpc('approve_user', {
        p_user_id: userId,
      })

      if (approveError) throw approveError

      await logAdminAction('user_approved', userId, userEmail)

      setMessage(`User ${userEmail} approved successfully`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to approve user')
    }
  }

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    try {
      // Ensure domain starts with @ as required by database constraint
      const domainWithAt = newDomain.toLowerCase().trim().startsWith('@') 
        ? newDomain.toLowerCase().trim() 
        : `@${newDomain.toLowerCase().trim()}`

      const { error: insertError } = await supabase
        .from('allowed_domains')
        .insert({
          domain: domainWithAt,
          notes: domainNotes.trim() || null,
          added_by: user?.id,
        })

      if (insertError) throw insertError

      await logAdminAction('domain_added', undefined, undefined, { domain: domainWithAt, notes: domainNotes })

      setMessage(`Domain ${domainWithAt} added successfully`)
      setNewDomain('')
      setDomainNotes('')
      fetchAllowedDomains()
    } catch (err: any) {
      setError(err.message || 'Failed to add domain')
    }
  }

  const removeDomain = async (domainId: string, domain: string) => {
    if (!window.confirm(`Are you sure you want to remove domain ${domain}?`)) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)

      if (deleteError) throw deleteError

      await logAdminAction('domain_removed', undefined, undefined, { domain })

      setMessage(`Domain ${domain} removed successfully`)
      fetchAllowedDomains()
    } catch (err: any) {
      setError(err.message || 'Failed to remove domain')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(user => user.id)
    )
  }

  const bulkActions = async (action: string) => {
    if (selectedUsers.length === 0) return

    const actionText = action === 'delete' ? 'delete' : action === 'promote' ? 'promote to admin' : 'demote from admin'
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} selected users?`)) {
      return
    }

    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId)
        if (!user) continue

        if (action === 'delete') {
          await deleteUser(userId, user.email)
        } else if (action === 'promote') {
          await toggleUserAdmin(userId, user.email, false)
        } else if (action === 'demote') {
          await toggleUserAdmin(userId, user.email, true)
        }
      }
      
      setSelectedUsers([])
      setMessage(`Bulk ${actionText} completed`)
    } catch (err: any) {
      setError(`Bulk ${actionText} failed: ${err.message}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <TooltipProvider>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Panel</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage users, view activity logs, and configure system settings
            </p>
          </div>

        {/* Messages */}
        {message && (
          <div className="border border-green-200 bg-green-50 text-green-800 p-4 rounded-lg">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-800 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-2 sm:px-1 text-sm whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">User Management</span>
            <span className="xs:hidden">Users</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-2 sm:px-1 text-sm whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="inline h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Audit Logs</span>
            <span className="xs:hidden">Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-2 px-2 sm:px-1 text-sm whitespace-nowrap ${
              activeTab === 'domains'
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="inline h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Allowed Domains</span>
            <span className="xs:hidden">Domains</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Bulk Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fetchUsers()}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">
                        {selectedUsers.length} users selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => bulkActions('promote')}
                          variant="outline"
                          size="sm"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                        <Button
                          onClick={() => bulkActions('demote')}
                          variant="outline"
                          size="sm"
                        >
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Demote
                        </Button>
                        <Button
                          onClick={() => bulkActions('delete')}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={toggleSelectAll}
                              className="flex items-center"
                            >
                              {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((userData) => (
                          <tr key={userData.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleUserSelection(userData.id)}
                                className="flex items-center"
                              >
                                {selectedUsers.includes(userData.id) ? (
                                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {userData.full_name || 'No name set'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {userData.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userData.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {userData.status === 'approved' ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userData.is_admin
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {userData.is_admin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => toggleUserAdmin(
                                        userData.id,
                                        userData.email,
                                        userData.is_admin || false
                                      )}
                                      variant="outline"
                                      size="sm"
                                    >
                                      {userData.is_admin ? (
                                        <ShieldOff className="h-4 w-4" />
                                      ) : (
                                        <Shield className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{userData.is_admin ? 'Remove Admin Access' : 'Grant Admin Access'}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => sendPasswordReset(userData.email)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Send Password Reset Email</p>
                                  </TooltipContent>
                                </Tooltip>
                                {!userData.email_confirmed_at && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => approveUser(userData.id, userData.email)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Approve User Account</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => deleteUser(userData.id, userData.email)}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete User Account</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Recent administrative actions and system events
                </p>
                <Button onClick={() => fetchAuditLogs()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.admin_user_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.target_user_email || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                            {log.metadata ? JSON.stringify(log.metadata) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {auditLogs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No audit logs found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'domains' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Allowed Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Domain Form */}
                <form onSubmit={addDomain} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain</label>
                      <input
                        id="newDomain"
                        placeholder="example.com (@ will be added automatically)"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="domainNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                      <input
                        id="domainNotes"
                        placeholder="Organization or purpose"
                        value={domainNotes}
                        onChange={(e) => setDomainNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Domain
                  </Button>
                </form>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Domains from which new user registrations are automatically approved
                  </p>
                  <Button onClick={() => fetchAllowedDomains()} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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
                              <Button
                                onClick={() => removeDomain(domain.id, domain.domain)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {allowedDomains.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No allowed domains configured</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </TooltipProvider>
    </Layout>
  )
}