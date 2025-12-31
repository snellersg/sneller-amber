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
  Plus,
  Globe,
  MapIcon,
  ChevronRight,
  X
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
  whose_contract?: string
  phone?: string
  email?: string
  address?: string
  boss_url?: string
  wr_maps_url?: string
  lm_map_url?: string
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
    account_manager: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountManagers, setAccountManagers] = useState<string[]>([])

  // Fetch unique account managers on component mount
  useEffect(() => {
    const fetchAccountManagers = async () => {
      try {
        const { data, error } = await supabase
          .from('active_accounts')
          .select('account_manager')
          .not('account_manager', 'is', null)
          .not('account_manager', 'eq', '')

        if (error) throw error

        // Get unique account managers and sort them
        const uniqueManagers = [...new Set(data?.map(item => item.account_manager).filter(Boolean))].sort()
        setAccountManagers(uniqueManagers)
      } catch (err) {
        console.error('Error fetching account managers:', err)
      }
    }

    fetchAccountManagers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.property_name.trim()) {
      setError('Property name is required')
      return
    }

    if (!formData.account_manager.trim()) {
      setError('Account manager is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get current user to ensure we're authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create accounts')
      }

      // Explicitly insert into active_accounts table with proper data structure
      const { data, error: insertError } = await supabase
        .from('active_accounts')
        .insert({
          property_name: formData.property_name.trim(),
          account_manager: formData.account_manager.trim()
        })
        .select()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw insertError
      }

      console.log('Successfully created account:', data)
      onAccountAdded()
      onClose()
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
            <div className="grid grid-cols-1 gap-4">
              {/* Property Name - Required */}
              <div>
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

              {/* Account Manager - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Manager *
                </label>
                <div className="relative">
                  <select
                    value={formData.account_manager}
                    onChange={(e) => handleInputChange('account_manager', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select an account manager</option>
                    {accountManagers.map((manager) => (
                      <option key={manager} value={manager}>
                        {manager}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
                disabled={loading || !formData.property_name.trim() || !formData.account_manager.trim()}
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
  
  // Initialize state from localStorage
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_searchTerm') || ''
    }
    return ''
  })
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_location') || 'all'
    }
    return 'all'
  })
  const [selectedManager, setSelectedManager] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_manager') || 'all'
    }
    return 'all'
  })
  const [selectedParentAccount, setSelectedParentAccount] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_parentAccount') || 'all'
    }
    return 'all'
  })
  const [selectedCustomerType, setSelectedCustomerType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_customerType') || 'all'
    }
    return 'all'
  })
  const [selectedImServiceLevel, setSelectedImServiceLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_imServiceLevel') || 'all'
    }
    return 'all'
  })
  const [selectedIrrigationCustomer, setSelectedIrrigationCustomer] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_irrigationCustomer') || 'all'
    }
    return 'all'
  })
  const [selectedWrArea, setSelectedWrArea] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_wrArea') || 'all'
    }
    return 'all'
  })
  const [selectedLmDistrict, setSelectedLmDistrict] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_lmDistrict') || 'all'
    }
    return 'all'
  })
  const [selectedWhoseContract, setSelectedWhoseContract] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeAccounts_whoseContract') || 'all'
    }
    return 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeAccounts_searchTerm', searchTerm)
  }, [searchTerm])

  useEffect(() => {
    localStorage.setItem('activeAccounts_location', selectedLocation)
  }, [selectedLocation])

  useEffect(() => {
    localStorage.setItem('activeAccounts_manager', selectedManager)
  }, [selectedManager])

  useEffect(() => {
    localStorage.setItem('activeAccounts_parentAccount', selectedParentAccount)
  }, [selectedParentAccount])

  useEffect(() => {
    localStorage.setItem('activeAccounts_customerType', selectedCustomerType)
  }, [selectedCustomerType])

  useEffect(() => {
    localStorage.setItem('activeAccounts_imServiceLevel', selectedImServiceLevel)
  }, [selectedImServiceLevel])

  useEffect(() => {
    localStorage.setItem('activeAccounts_irrigationCustomer', selectedIrrigationCustomer)
  }, [selectedIrrigationCustomer])

  useEffect(() => {
    localStorage.setItem('activeAccounts_wrArea', selectedWrArea)
  }, [selectedWrArea])

  useEffect(() => {
    localStorage.setItem('activeAccounts_lmDistrict', selectedLmDistrict)
  }, [selectedLmDistrict])

  useEffect(() => {
    localStorage.setItem('activeAccounts_whoseContract', selectedWhoseContract)
  }, [selectedWhoseContract])

  // Clear all filters function
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
    setSelectedWhoseContract('all')
  }

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



    // Apply whose contract filter
    if (selectedWhoseContract !== 'all') {
      filtered = filtered.filter(account => account.whose_contract === selectedWhoseContract)
    }

    return filtered
  }, [accounts, searchTerm, selectedLocation, selectedManager, selectedParentAccount, 
      selectedCustomerType, selectedImServiceLevel, selectedIrrigationCustomer, 
      selectedWrArea, selectedLmDistrict, selectedWhoseContract])

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
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">ACTIVE ACCOUNTS</h1>
          <p className="mt-1 text-xs text-gray-600">
            {isLoading ? 'Loading...' : `${filteredAccounts.length} of ${accounts.length} accounts`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons - Add Account (Admin), Filters and Refresh */}
            <div className="flex gap-2">
              {/* Add Account button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Account</span>
              </button>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-md text-xs font-medium ${
                  activeFiltersCount > 0 || showFilters
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 text-primary dark:text-primary'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Clear filters button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              )}

              {/* Refresh button */}
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {/* Location Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager
                  </label>
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Account
                  </label>
                  <select
                    value={selectedParentAccount}
                    onChange={(e) => setSelectedParentAccount(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={selectedCustomerType}
                    onChange={(e) => setSelectedCustomerType(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IM Service Level
                  </label>
                  <select
                    value={selectedImServiceLevel}
                    onChange={(e) => setSelectedImServiceLevel(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Irrigation Customer
                  </label>
                  <select
                    value={selectedIrrigationCustomer}
                    onChange={(e) => setSelectedIrrigationCustomer(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* WR Area Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WR Area
                  </label>
                  <select
                    value={selectedWrArea}
                    onChange={(e) => setSelectedWrArea(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LM District
                  </label>
                  <select
                    value={selectedLmDistrict}
                    onChange={(e) => setSelectedLmDistrict(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All LM Districts</option>
                    {uniqueLmDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>



                {/* Whose Contract Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Whose Contract
                  </label>
                  <select
                    value={selectedWhoseContract}
                    onChange={(e) => setSelectedWhoseContract(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAccounts.map((account) => (
              <div 
                key={account.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-3 cursor-pointer border dark:border-gray-700"
                onClick={() => handlePropertyClick(account.id)}
              >
                {/* Account Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {account.property_name}
                    </h3>
                    
                    {account.parent_account && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                        Parent: {account.parent_account}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                    {account.account_manager && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{account.account_manager}</span>
                      </div>
                    )}
                    {account.location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{account.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="flex items-center gap-4 mb-3">
                  {account.phone && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 flex-1 min-w-0">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <a 
                        href={`tel:${account.phone}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {account.phone}
                      </a>
                    </div>
                  )}

                  {account.email && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 flex-1 min-w-0">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <a 
                        href={`mailto:${account.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {account.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {/* Boss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (account.boss_url) {
                        window.open(account.boss_url, '_blank')
                      }
                    }}
                    disabled={!account.boss_url}
                    className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      account.boss_url
                        ? 'border border-[#0A93D5] text-[#0A93D5] hover:bg-[#0A93D5] hover:text-white'
                        : 'border border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    title={account.boss_url ? 'View in BOSS' : 'No BOSS URL available'}
                  >
                    <Globe className="h-3 w-3" />
                    BOSS
                  </button>

                  {/* WR Maps Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (account.wr_maps_url) {
                        window.open(account.wr_maps_url, '_blank')
                      }
                    }}
                    disabled={!account.wr_maps_url}
                    className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      account.wr_maps_url
                        ? 'border border-[#0A93D5] text-[#0A93D5] hover:bg-[#0A93D5] hover:text-white'
                        : 'border border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    title={account.wr_maps_url ? 'View WR Maps' : 'No WR Maps URL available'}
                  >
                    <MapIcon className="h-3 w-3" />
                    WR Map
                  </button>

                  {/* LM Map Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (account.lm_map_url) {
                        window.open(account.lm_map_url, '_blank')
                      }
                    }}
                    disabled={!account.lm_map_url}
                    className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      account.lm_map_url
                        ? 'border border-[#0A93D5] text-[#0A93D5] hover:bg-[#0A93D5] hover:text-white'
                        : 'border border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    title={account.lm_map_url ? 'View LM Map' : 'No LM Map URL available'}
                  >
                    <MapIcon className="h-3 w-3" />
                    LM Map
                  </button>

                  {/* Property Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePropertyClick(account.id)
                    }}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#0A93D5] text-white hover:bg-[#0A93D5]/90 transition-colors"
                    title="View Property Details"
                  >
                    More
                    <ChevronRight className="h-3 w-3" />
                  </button>
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
