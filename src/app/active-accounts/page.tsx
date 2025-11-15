'use client'

import { useState, useMemo } from 'react'
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
  Loader2
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
  const { data, error } = await supabase
    .from('active_accounts')
    .select('*')
    .order('property_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
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
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Building2 className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load accounts</h3>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Accounts</h1>
            <p className="mt-2 text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${filteredAccounts.length} of ${accounts.length} accounts`}
            </p>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center space-x-2 px-4 py-2 border rounded-md text-sm font-medium ${
                activeFiltersCount > 0 || showFilters
                  ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {account.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {account.boss_url && (
                    <a
                      href={account.boss_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 ml-2"
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
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
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
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                      >
                        {account.email}
                      </a>
                    </div>
                  )}

                  {/* Service badges - removed border and reduced spacing */}
                  {(account.customer_type || account.im_service_level || account.irrigation_customer) && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {account.customer_type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {account.customer_type}
                          </span>
                        )}
                        {account.im_service_level && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {account.im_service_level}
                          </span>
                        )}
                        {account.irrigation_customer && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Irrigation
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}