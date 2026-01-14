'use client'

// ARCHIVED: Active Accounts feature has been temporarily disabled
// This page is archived and can be restored in the future if needed
// Original implementation used Supabase 'active_accounts' table

import Layout from '@/components/Layout'
import { Archive } from 'lucide-react'

export default function ActiveAccountsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Active Accounts
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Account management and property information system.
          </p>
        </div>

        {/* Disabled Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
          <Archive className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Feature Temporarily Disabled
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            The Active Accounts feature has been temporarily disabled and archived. 
            This helps reduce system resources while the feature is not in active use.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            This feature can be restored in the future if needed.
          </p>
        </div>
      </div>
    </Layout>
  )
}

/* ARCHIVED CODE - Original implementation with Supabase

The original code used:
- Supabase table: 'active_accounts'
- TanStack Query for data fetching
- Real-time account management features
- Account filtering and search
- Add/Edit/Delete functionality

Original file archived as: page_archived.tsx

*/
