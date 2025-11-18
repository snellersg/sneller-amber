'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ExternalLink,
  Loader2,
  RotateCcw,
  Plus
} from 'lucide-react'

interface Account {
  id: number
  property_name: string
  parent_account?: string
  location?: string
  account_manager?: string
  customer_type?: string
  im_service_level?: string
  irrigation_customer?: boolean
  wr_area?: string
  lm_district?: string
  cfl?: string
  whose_contract?: string
  phone?: string
  email?: string
  address?: string
  boss_url?: string
}

async function fetchAccounts(): Promise<Account[]> {
  try {
    // Check if user is authenticated first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Authentication error:', authError)
      throw new Error(`Authentication failed: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User not authenticated. Please log in again.')
    }
    
    console.log('Authenticated user:', user.email)

    const { data, error } = await supabase
      .from('active_accounts')
      .select('*')
      .order('property_name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      // Provide more specific error messages
      if (error.code === 'PGRST116') {
        throw new Error('No access to accounts data. Please contact your administrator to set up your permissions.')
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Your account may not have access to view accounts.')
      } else {
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
      }
    }

    console.log(`Loaded ${data?.length || 0} accounts`)
    return data || []
  } catch (error) {
    console.error('Error in fetchAccounts:', error)
    throw error
  }
}

// Add Account Modal Component
interface AddAccountModalProps {
  onClose: () => void
  onAccountAdded: () => void
}

function AddAccountModal({ onClose, onAccountAdded }: AddAccountModalProps) {
  const [formData, setFormData] = useState({
    property_name: '',
    address: '',
    parent_account: '',
    location: '',
    account_manager: '',
    customer_type: '',
    phone: '',
    email: '',
    wr_area: '',
    lm_district: '',
    cfl: '',
    whose_contract: '',
    im_service_level: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.property_name.trim()) {
      setError('Property name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('active_accounts')
        .insert([{
          ...formData,
          property_name: formData.property_name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null
        }])

      if (insertError) throw insertError

      onAccountAdded()
    } catch (err: any) {
      console.error('Error creating account:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">ADD NEW ACCOUNT</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Name - Required */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Name *
                </label>
                <input
                  type="text"
                  value={formData.property_name}
                  onChange={(e) => handleInputChange('property_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter property name"
                  required
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter property address"
                />
              </div>

              {/* Parent Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Account
                </label>
                <input
                  type="text"
                  value={formData.parent_account}
                  onChange={(e) => handleInputChange('parent_account', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter parent account"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter location"
                />
              </div>

              {/* Account Manager */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Manager
                </label>
                <input
                  type="text"
                  value={formData.account_manager}
                  onChange={(e) => handleInputChange('account_manager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter account manager"
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Type
                </label>
                <input
                  type="text"
                  value={formData.customer_type}
                  onChange={(e) => handleInputChange('customer_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter customer type"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.property_name.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ActiveAccountsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedManager, setSelectedManager] = useState('all')
  const [selectedParentAccount, setSelectedParentAccount] = useState('all')
  const [selectedCustomerType, setSelectedCustomerType] = useState('all')
  const [selectedImServiceLevel, setSelectedImServiceLevel] = useState('all')
  const [selectedIrrigationCustomer, setSelectedIrrigationCustomer] = useState('all')
  const [selectedWrArea, setSelectedWrArea] = useState('all')
  const [selectedLmDistrict, setSelectedLmDistrict] = useState('all')
  const [selectedCfl, setSelectedCfl] = useState('all')
  const [selectedWhoseContract, setSelectedWhoseContract] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Check user admin status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          setUser(user)
          const adminStatus = user.user_metadata?.isAdmin || user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        setUser(null)
        setIsAdmin(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const adminStatus = session.user.user_metadata?.isAdmin || session.user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Use TanStack Query for data fetching with background updates
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['active-accounts'],
    queryFn: fetchAccounts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3
  })

  // Get unique values for filters
  const uniqueLocations = useMemo(() => {
    const locations = accounts
      .map(account => account.location)
      .filter((location): location is string => Boolean(location))
    return Array.from(new Set(locations)).sort()
  }, [accounts])

  const uniqueManagers = useMemo(() => {
    const managers = accounts
      .map(account => account.account_manager)
      .filter((manager): manager is string => Boolean(manager))
    return Array.from(new Set(managers)).sort()
  }, [accounts])

  const uniqueParentAccounts = useMemo(() => {
    const parents = accounts
      .map(account => account.parent_account)
      .filter((parent): parent is string => Boolean(parent))
    return Array.from(new Set(parents)).sort()
  }, [accounts])

  const uniqueCustomerTypes = useMemo(() => {
    const types = accounts
      .map(account => account.customer_type)
      .filter((type): type is string => Boolean(type))
    return Array.from(new Set(types)).sort()
  }, [accounts])

  const uniqueImServiceLevels = useMemo(() => {
    const levels = accounts
      .map(account => account.im_service_level)
      .filter((level): level is string => Boolean(level))
    return Array.from(new Set(levels)).sort()
  }, [accounts])

  const uniqueWrAreas = useMemo(() => {
    const areas = accounts
      .map(account => account.wr_area)
      .filter((area): area is string => Boolean(area))
    return Array.from(new Set(areas)).sort()
  }, [accounts])

  const uniqueLmDistricts = useMemo(() => {
    const districts = accounts
      .map(account => account.lm_district)
      .filter((district): district is string => Boolean(district))
    return Array.from(new Set(districts)).sort()
  }, [accounts])

  const uniqueCfls = useMemo(() => {
    const cfls = accounts
      .map(account => account.cfl)
      .filter((cfl): cfl is string => Boolean(cfl))
    return Array.from(new Set(cfls)).sort()
  }, [accounts])

  const uniqueWhoseContracts = useMemo(() => {
    const contracts = accounts
      .map(account => account.whose_contract)
      .filter((contract): contract is string => Boolean(contract))
    return Array.from(new Set(contracts)).sort()
  }, [accounts])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(account =>
        account.property_name?.toLowerCase().includes(search) ||
        account.parent_account?.toLowerCase().includes(search) ||
        account.location?.toLowerCase().includes(search) ||
        account.account_manager?.toLowerCase().includes(search) ||
        account.address?.toLowerCase().includes(search) ||
        account.phone?.toLowerCase().includes(search) ||
        account.email?.toLowerCase().includes(search)
      )
    }

    // Apply location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(account => account.location === selectedLocation)
    }

    // Apply manager filter
    if (selectedManager !== 'all') {
      filtered = filtered.filter(account => account.account_manager === selectedManager)
    }

    // Apply parent account filter
    if (selectedParentAccount !== 'all') {
      filtered = filtered.filter(account => account.parent_account === selectedParentAccount)
    }

    // Apply customer type filter
    if (selectedCustomerType !== 'all') {
      filtered = filtered.filter(account => account.customer_type === selectedCustomerType)
    }

    // Apply IM service level filter
    if (selectedImServiceLevel !== 'all') {
      filtered = filtered.filter(account => account.im_service_level === selectedImServiceLevel)
    }

    // Apply irrigation customer filter
    if (selectedIrrigationCustomer !== 'all') {
      const isIrrigation = selectedIrrigationCustomer === 'yes'
      filtered = filtered.filter(account => account.irrigation_customer === isIrrigation)
    }

    // Apply WR area filter
    if (selectedWrArea !== 'all') {
      filtered = filtered.filter(account => account.wr_area === selectedWrArea)
    }

    // Apply LM district filter
    if (selectedLmDistrict !== 'all') {
      filtered = filtered.filter(account => account.lm_district === selectedLmDistrict)
    }

    // Apply CFL filter
    if (selectedCfl !== 'all') {
      filtered = filtered.filter(account => account.cfl === selectedCfl)
    }

    // Apply whose contract filter
    if (selectedWhoseContract !== 'all') {
      filtered = filtered.filter(account => account.whose_contract === selectedWhoseContract)
    }

    return filtered
  }, [accounts, searchTerm, selectedLocation, selectedManager, selectedParentAccount, 
      selectedCustomerType, selectedImServiceLevel, selectedIrrigationCustomer, 
      selectedWrArea, selectedLmDistrict, selectedCfl, selectedWhoseContract])

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedLocation('all')
    setSelectedManager('all')
    setSelectedParentAccount('all')
    setSelectedCustomerType('all')
    setSelectedImServiceLevel('all')
    setSelectedIrrigationCustomer('all')
    setSelectedWrArea('all')
    setSelectedLmDistrict('all')
    setSelectedCfl('all')
    setSelectedWhoseContract('all')
  }

  const activeFiltersCount = [
    searchTerm,
    selectedLocation !== 'all' ? selectedLocation : null,
    selectedManager !== 'all' ? selectedManager : null,
    selectedParentAccount !== 'all' ? selectedParentAccount : null,
    selectedCustomerType !== 'all' ? selectedCustomerType : null,
    selectedImServiceLevel !== 'all' ? selectedImServiceLevel : null,
    selectedIrrigationCustomer !== 'all' ? selectedIrrigationCustomer : null,
    selectedWrArea !== 'all' ? selectedWrArea : null,
    selectedLmDistrict !== 'all' ? selectedLmDistrict : null,
    selectedCfl !== 'all' ? selectedCfl : null,
    selectedWhoseContract !== 'all' ? selectedWhoseContract : null
  ].filter(Boolean).length

  const handlePropertyClick = (accountId: number) => {
    router.push(`/active-accounts/${accountId}`)
  }

  if (error) {
    console.error('Active accounts query error:', error)
    
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Building2 className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load accounts</h3>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
            
            {/* Show specific permission error help */}
            {error.message.includes('permission') || error.message.includes('policy') || error.message.includes('RLS') ? (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Database Permission Issue</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This appears to be a Row Level Security (RLS) policy issue. Please contact your administrator to ensure your account has the proper permissions to view active accounts.
                </p>
              </div>
            ) : null}
            
            {/* Show empty results help */}
            {error.message.includes('No rows') || accounts.length === 0 ? (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">No Data Available</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  No active accounts found. This could be due to database permissions or empty data.
                </p>
              </div>
            ) : null}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ACTIVE ACCOUNTS</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isLoading ? 'Loading...' : `${filteredAccounts.length} of ${accounts.length} accounts`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons - Add Account (Admin), Filters and Refresh */}
            <div className="flex gap-3">
              {/* Add Account button - Admin Only */}
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Account</span>
                </button>
              )}

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center space-x-2 px-4 py-2 border rounded-md text-sm font-medium ${
                  activeFiltersCount > 0 || showFilters
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 text-primary dark:text-primary'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Refresh button */}
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manager Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Manager
                  </label>
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Managers</option>
                    {uniqueManagers.map(manager => (
                      <option key={manager} value={manager}>
                        {manager}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Account Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Account
                  </label>
                  <select
                    value={selectedParentAccount}
                    onChange={(e) => setSelectedParentAccount(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Parent Accounts</option>
                    {uniqueParentAccounts.map(parent => (
                      <option key={parent} value={parent}>
                        {parent}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={selectedCustomerType}
                    onChange={(e) => setSelectedCustomerType(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    {uniqueCustomerTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* IM Service Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IM Service Level
                  </label>
                  <select
                    value={selectedImServiceLevel}
                    onChange={(e) => setSelectedImServiceLevel(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Service Levels</option>
                    {uniqueImServiceLevels.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Irrigation Customer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Irrigation Customer
                  </label>
                  <select
                    value={selectedIrrigationCustomer}
                    onChange={(e) => setSelectedIrrigationCustomer(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* WR Area Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WR Area
                  </label>
                  <select
                    value={selectedWrArea}
                    onChange={(e) => setSelectedWrArea(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All WR Areas</option>
                    {uniqueWrAreas.map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LM District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LM District
                  </label>
                  <select
                    value={selectedLmDistrict}
                    onChange={(e) => setSelectedLmDistrict(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All LM Districts</option>
                    {uniqueLmDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CFL Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CFL
                  </label>
                  <select
                    value={selectedCfl}
                    onChange={(e) => setSelectedCfl(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All CFLs</option>
                    {uniqueCfls.map(cfl => (
                      <option key={cfl} value={cfl}>
                        {cfl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Whose Contract Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Whose Contract
                  </label>
                  <select
                    value={selectedWhoseContract}
                    onChange={(e) => setSelectedWhoseContract(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Contracts</option>
                    {uniqueWhoseContracts.map(contract => (
                      <option key={contract} value={contract}>
                        {contract}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    disabled={activeFiltersCount === 0}
                    className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accounts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No accounts found</h3>
            <p className="text-gray-600 mt-2">
              {accounts.length === 0 
                ? "No accounts are currently available."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <div 
                key={account.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border dark:border-gray-700"
                onClick={() => handlePropertyClick(account.id)}
              >
                {/* Account Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {account.property_name}
                    </h3>
                    
                    {account.parent_account && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Parent: {account.parent_account}
                      </p>
                    )}

                    {/* Separator line */}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-3"></div>

                    {/* Account Manager and Location on same line */}
                    <div className="flex items-center gap-3 mb-1">
                      {account.account_manager && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span>{account.account_manager}</span>
                        </div>
                      )}
                      {account.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{account.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {account.boss_url && (
                    <a
                      href={account.boss_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-2"
                      title="Open in BOSS"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Account Details */}
                <div className="space-y-2">
                  {account.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a 
                        href={`tel:${account.phone}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {account.phone}
                      </a>
                    </div>
                  )}

                  {account.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <a 
                        href={`mailto:${account.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        {account.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <AddAccountModal 
          onClose={() => setShowAddModal(false)}
          onAccountAdded={() => {
            setShowAddModal(false)
            refetch() // Refresh the accounts list
          }}
        />
      )}
    </Layout>
  )
}
