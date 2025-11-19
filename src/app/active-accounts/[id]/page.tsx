'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { 
  ArrowLeft, MapPin, User, Building, Building2, MapPinned, FileText, AudioLines, Globe, 
  ExternalLink, Briefcase, ClipboardList, Snowflake, ShieldPlus, LocateFixed, CalendarX, 
  MapIcon, FileSearch, Eye, Download, Trash2, Upload, Leaf, CalendarDays, Edit2, Save, X 
} from 'lucide-react';

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
  created_at?: string
  updated_at?: string
  wr_customer?: boolean
  lm_customer?: boolean
  wr_expiration_date?: string
  lm_expiration_date?: string
  wr_maps_url?: string
  lm_map_url?: string
  wr_contract_pdf_url?: string
  wr_contract_pdf_name?: string
  wr_contract_uploaded_at?: string
  lm_contract_pdf_url?: string
  lm_contract_pdf_name?: string
  lm_contract_uploaded_at?: string
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Editing state (only available for admins)
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Account | null>(null);

  // File upload state
  const [uploadingWR, setUploadingWR] = useState(false);
  const [uploadingLM, setUploadingLM] = useState(false);
  const [deletingWR, setDeletingWR] = useState(false);
  const [deletingLM, setDeletingLM] = useState(false);
  const [showWRViewer, setShowWRViewer] = useState(false);
  const [showLMViewer, setShowLMViewer] = useState(false);
  const [wrSignedUrl, setWrSignedUrl] = useState('');
  const [lmSignedUrl, setLmSignedUrl] = useState('');

  // File input refs
  const wrFileInputRef = useRef<HTMLInputElement>(null);
  const lmFileInputRef = useRef<HTMLInputElement>(null);

  const accountId = params.id as string

  // Check user admin status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          setUser(user)
          // Check if user is admin from metadata
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

  useEffect(() => {
    async function fetchAccountDetail() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('active_accounts')
          .select('*')
          .eq('id', accountId)
          .single()

        if (error) throw error

        setAccount(data)
        setEditedAccount(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load account details')
      } finally {
        setLoading(false)
      }
    }

    if (accountId) {
      fetchAccountDetail()
    }
  }, [accountId])

  const handleSave = async () => {
    if (!editedAccount) return;
    
    try {
      setSaving(true);

      // Update account details
      const { error: accountError } = await supabase
        .from('active_accounts')
        .update({
          property_name: editedAccount.property_name,
          address: editedAccount.address,
          parent_account: editedAccount.parent_account,
          location: editedAccount.location,
          account_manager: editedAccount.account_manager,
          whose_contract: editedAccount.whose_contract,
          lm_map_url: editedAccount.lm_map_url,
          wr_maps_url: editedAccount.wr_maps_url,
          boss_url: editedAccount.boss_url,
          im_service_level: editedAccount.im_service_level,
          wr_area: editedAccount.wr_area,
          wr_expiration_date: editedAccount.wr_expiration_date,
          wr_customer: editedAccount.wr_customer,
          lm_district: editedAccount.lm_district,
          lm_expiration_date: editedAccount.lm_expiration_date,
          lm_customer: editedAccount.lm_customer,
          irrigation_customer: editedAccount.irrigation_customer
        })
        .eq('id', accountId);

      if (accountError) throw accountError;

      // Refetch data
      const { data } = await supabase
        .from('active_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      
      setAccount(data);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating account:', err);
      alert(`Failed to save changes: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedAccount(account);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('active_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      router.push('/active-accounts');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  // WR Contract Upload
  const handleWRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    try {
      setUploadingWR(true);

      const fileExt = 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('Contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('active_accounts')
        .update({
          wr_contract_pdf_url: fileName,
          wr_contract_pdf_name: file.name,
          wr_contract_uploaded_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Refetch data
      const { data } = await supabase
        .from('active_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      setAccount(data);
      setEditedAccount(data);
      
      alert('WR Contract uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading WR contract:', err);
      alert('Failed to upload WR contract. Please try again.');
    } finally {
      setUploadingWR(false);
      if (wrFileInputRef.current) {
        wrFileInputRef.current.value = '';
      }
    }
  };

  // LM Contract Upload
  const handleLMUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    try {
      setUploadingLM(true);

      const fileExt = 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('Contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('active_accounts')
        .update({
          lm_contract_pdf_url: fileName,
          lm_contract_pdf_name: file.name,
          lm_contract_uploaded_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Refetch data
      const { data } = await supabase
        .from('active_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      setAccount(data);
      setEditedAccount(data);

      alert('LM Contract uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading LM contract:', err);
      alert('Failed to upload LM contract. Please try again.');
    } finally {
      setUploadingLM(false);
      if (lmFileInputRef.current) {
        lmFileInputRef.current.value = '';
      }
    }
  };

  // PDF Download handlers
  const handleWRDownload = async () => {
    if (!account?.wr_contract_pdf_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('Contracts')
        .download(account.wr_contract_pdf_url);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = account.wr_contract_pdf_name || 'WR_Contract.pdf';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleLMDownload = async () => {
    if (!account?.lm_contract_pdf_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('Contracts')
        .download(account.lm_contract_pdf_url);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = account.lm_contract_pdf_name || 'LM_Contract.pdf';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  // PDF Delete handlers
  const handleWRDelete = async () => {
    if (!confirm('Are you sure you want to delete the WR Contract PDF?')) {
      return;
    }

    try {
      setDeletingWR(true);

      if (account?.wr_contract_pdf_url) {
        await supabase.storage.from('Contracts').remove([account.wr_contract_pdf_url]).catch(console.warn);
      }

      const { error: updateError } = await supabase
        .from('active_accounts')
        .update({
          wr_contract_pdf_url: null,
          wr_contract_pdf_name: null,
          wr_contract_uploaded_at: null
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Refetch data
      const { data } = await supabase
        .from('active_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      setAccount(data);
      setEditedAccount(data);

      alert('WR Contract deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting WR contract:', err);
      alert('Failed to delete WR contract. Please try again.');
    } finally {
      setDeletingWR(false);
    }
  };

  const handleLMDelete = async () => {
    if (!confirm('Are you sure you want to delete the LM Contract PDF?')) {
      return;
    }

    try {
      setDeletingLM(true);

      if (account?.lm_contract_pdf_url) {
        await supabase.storage.from('Contracts').remove([account.lm_contract_pdf_url]).catch(console.warn);
      }

      const { error: updateError } = await supabase
        .from('active_accounts')
        .update({
          lm_contract_pdf_url: null,
          lm_contract_pdf_name: null,
          lm_contract_uploaded_at: null
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Refetch data  
      const { data } = await supabase
        .from('active_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      setAccount(data);
      setEditedAccount(data);

      alert('LM Contract deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting LM contract:', err);
      alert('Failed to delete LM contract. Please try again.');
    } finally {
      setDeletingLM(false);
    }
  };

  // PDF View handlers
  const generateWRSignedUrl = async () => {
    if (!account?.wr_contract_pdf_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('Contracts')
        .createSignedUrl(account.wr_contract_pdf_url, 3600);

      if (error) throw error;
      setWrSignedUrl(data.signedUrl);
      setShowWRViewer(true);
    } catch (err: any) {
      console.error('Error generating signed URL:', err);
      alert('Failed to load PDF viewer. Please try again.');
    }
  };

  const generateLMSignedUrl = async () => {
    if (!account?.lm_contract_pdf_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('Contracts')
        .createSignedUrl(account.lm_contract_pdf_url, 3600);

      if (error) throw error;
      setLmSignedUrl(data.signedUrl);
      setShowLMViewer(true);
    } catch (err: any) {
      console.error('Error generating signed URL:', err);
      alert('Failed to load PDF viewer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="size-8 animate-spin rounded-full border-2 border-muted border-t-[#0A93D5]"
            role="status"
          ></div>
          <p className="text-sm text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading property details</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/active-accounts')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Active Accounts
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              {isAdmin && isEditing ? (
                <input
                  type="text"
                  value={editedAccount?.property_name || ''}
                  onChange={(e) => setEditedAccount({ ...editedAccount!, property_name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary focus:outline-none w-full"
                  placeholder="Property Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{account.property_name}</h1>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* View in Boss button - always visible if URL exists */}
              {account.boss_url && (
                <a
                  href={account.boss_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Globe className="h-3 w-3" />
                  View in BOSS
                </a>
              )}
              
              {/* Edit/Save/Delete Buttons - Admin Only */}
              {isAdmin && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center px-2 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Property Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-2 sm:p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              PROPERTY DETAILS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-x-6 sm:gap-y-4">
              {/* Property Name */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Building className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Property Name</span>
                </div>
                {isAdmin && isEditing ? (
                  <input
                    type="text"
                    value={editedAccount?.property_name || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, property_name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter property name"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.property_name}</p>
                )}
              </div>

              {/* Address */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <MapPin className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Address</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAccount?.address || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, address: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter property address"
                  />
                ) : account.address ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(account.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline"
                  >
                    {account.address}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No address set</p>
                )}
              </div>

              {/* Parent Account */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Building2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Parent Account</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAccount?.parent_account || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, parent_account: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter parent account"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.parent_account || '—'}</p>
                )}
              </div>

              {/* Location */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <MapPinned className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Location</span>
                </div>
                {isEditing ? (
                  <select
                    value={editedAccount?.location || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, location: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="GRR">GRR</option>
                    <option value="LAN">LAN</option>
                    <option value="KZOO">KZOO</option>
                    <option value="SSP">SSP</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.location || '—'}</p>
                )}
              </div>

              {/* Account Manager */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Account Manager</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAccount?.account_manager || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, account_manager: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter account manager"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.account_manager || '—'}</p>
                )}
              </div>

              {/* Whose Contract */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <FileText className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Whose Contract</span>
                </div>
                {isEditing ? (
                  <select
                    value={editedAccount?.whose_contract || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, whose_contract: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    <option value="Ours">Ours</option>
                    <option value="Theirs">Theirs</option>
                  </select>
                ) : account.whose_contract ? (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.whose_contract}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not specified</p>
                )}
              </div>

              {/* Boss URL - Editing Only */}
              {isAdmin && isEditing && (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Globe className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Boss URL</span>
                  </div>
                  <input
                    type="url"
                    value={editedAccount?.boss_url || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount!, boss_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-2 sm:p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              SERVICE INFORMATION
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* WR Services */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">WR SERVICES</h4>
                
                <div className="space-y-0">
                  {/* WR Customer Status */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Snowflake className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">WR Customer</span>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedAccount?.wr_customer === null || editedAccount?.wr_customer === undefined ? '' : editedAccount?.wr_customer ? 'true' : 'false'}
                        onChange={(e) => setEditedAccount({
                          ...editedAccount!,
                          wr_customer: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value=""></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <p className={account.wr_customer === null || account.wr_customer === undefined 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.wr_customer === null || account.wr_customer === undefined 
                          ? 'Not specified' 
                          : account.wr_customer 
                          ? 'Yes' 
                          : 'No'
                        }
                      </p>
                    )}
                  </div>

                  {/* IM Service Level */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <ShieldPlus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">IM Service Level</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedAccount?.im_service_level || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, im_service_level: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter IM service level"
                      />
                    ) : (
                      <p className={!account.im_service_level 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.im_service_level || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* WR Area */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <LocateFixed className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">WR Area</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedAccount?.wr_area || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, wr_area: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter WR area"
                      />
                    ) : (
                      <p className={!account.wr_area 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.wr_area || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* WR Expiration Date */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <CalendarX className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">WR Expiration</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedAccount?.wr_expiration_date || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, wr_expiration_date: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : account.wr_expiration_date ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {new Date(account.wr_expiration_date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {new Date(account.wr_expiration_date) < new Date() && (
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-bold">
                            EXPIRED
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No expiration set</p>
                    )}
                  </div>

                  {/* WR Maps URL */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <MapIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">WR Maps</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedAccount?.wr_maps_url || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, wr_maps_url: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://..."
                      />
                    ) : account.wr_maps_url ? (
                      <a
                        href={account.wr_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                      >
                        <MapIcon className="h-3 w-3" />
                        View Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No maps available</p>
                    )}
                  </div>

                  {/* WR Contract PDF */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <FileSearch className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">WR Contract</span>
                    </div>
                    {account.wr_contract_pdf_url ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.wr_contract_pdf_name || 'Contract.pdf'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Uploaded {account.wr_contract_uploaded_at ? new Date(account.wr_contract_uploaded_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={generateWRSignedUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                          >
                            <Eye className="h-3 w-3" />
                            View PDF
                          </button>
                          <button
                            onClick={handleWRDownload}
                            className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Download"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={handleWRDelete}
                              disabled={deletingWR}
                              className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                              title={deletingWR ? "Deleting..." : "Delete"}
                            >
                              {deletingWR ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={wrFileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleWRUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => wrFileInputRef.current?.click()}
                          disabled={uploadingWR}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                          {uploadingWR ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3" />
                              Upload Contract
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LM Services */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">LM SERVICES</h4>
                
                <div className="space-y-0">
                  {/* LM Customer Status */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Leaf className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LM Customer</span>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedAccount?.lm_customer === null || editedAccount?.lm_customer === undefined ? '' : editedAccount?.lm_customer ? 'true' : 'false'}
                        onChange={(e) => setEditedAccount({
                          ...editedAccount!,
                          lm_customer: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value=""></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <p className={account.lm_customer === null || account.lm_customer === undefined 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.lm_customer === null || account.lm_customer === undefined 
                          ? 'Not specified' 
                          : account.lm_customer 
                          ? 'Yes' 
                          : 'No'
                        }
                      </p>
                    )}
                  </div>

                  {/* Irrigation Customer */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <ShieldPlus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Irrigation Customer</span>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedAccount?.irrigation_customer === null || editedAccount?.irrigation_customer === undefined ? '' : editedAccount?.irrigation_customer ? 'true' : 'false'}
                        onChange={(e) => setEditedAccount({
                          ...editedAccount!,
                          irrigation_customer: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value=""></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <p className={account.irrigation_customer === null || account.irrigation_customer === undefined 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.irrigation_customer === null || account.irrigation_customer === undefined 
                          ? 'Not specified' 
                          : account.irrigation_customer 
                          ? 'Yes' 
                          : 'No'
                        }
                      </p>
                    )}
                  </div>

                  {/* LM District */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <LocateFixed className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LM District</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedAccount?.lm_district || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, lm_district: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter LM district"
                      />
                    ) : (
                      <p className={!account.lm_district 
                        ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                        : "text-sm text-gray-900 dark:text-white font-medium"
                      }>
                        {account.lm_district || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* LM Expiration Date */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <CalendarDays className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LM Expiration</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedAccount?.lm_expiration_date || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, lm_expiration_date: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : account.lm_expiration_date ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {new Date(account.lm_expiration_date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {new Date(account.lm_expiration_date) < new Date() && (
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-bold">
                            EXPIRED
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No expiration set</p>
                    )}
                  </div>

                  {/* LM Maps URL */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <MapIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LM Maps</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedAccount?.lm_map_url || ''}
                        onChange={(e) => setEditedAccount({ ...editedAccount!, lm_map_url: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://..."
                      />
                    ) : account.lm_map_url ? (
                      <a
                        href={account.lm_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                      >
                        <MapIcon className="h-3 w-3" />
                        View Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No maps available</p>
                    )}
                  </div>

                  {/* LM Contract PDF */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <FileSearch className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LM Contract</span>
                    </div>
                    {account.lm_contract_pdf_url ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.lm_contract_pdf_name || 'Contract.pdf'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Uploaded {account.lm_contract_uploaded_at ? new Date(account.lm_contract_uploaded_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={generateLMSignedUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                          >
                            <Eye className="h-3 w-3" />
                            View PDF
                          </button>
                          <button
                            onClick={handleLMDownload}
                            className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Download"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={handleLMDelete}
                              disabled={deletingLM}
                              className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                              title={deletingLM ? "Deleting..." : "Delete"}
                            >
                              {deletingLM ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={lmFileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleLMUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => lmFileInputRef.current?.click()}
                          disabled={uploadingLM}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                          {uploadingLM ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3" />
                              Upload Contract
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewers */}
      {showWRViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl max-h-[90vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">WR Contract PDF</h3>
              <button
                onClick={() => {
                  setShowWRViewer(false);
                  setWrSignedUrl('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <iframe
              src={wrSignedUrl}
              className="w-full h-[70vh] border border-gray-300 dark:border-gray-600 rounded"
              title="WR Contract PDF"
            />
          </div>
        </div>
      )}

      {showLMViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl max-h-[90vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">LM Contract PDF</h3>
              <button
                onClick={() => {
                  setShowLMViewer(false);
                  setLmSignedUrl('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <iframe
              src={lmSignedUrl}
              className="w-full h-[70vh] border border-gray-300 dark:border-gray-600 rounded"
              title="LM Contract PDF"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}