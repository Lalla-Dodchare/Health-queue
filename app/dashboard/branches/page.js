'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import UserHeader from '@/components/UserHeader'
import { MapPin, ChevronRight, Building2 } from 'lucide-react'

export default function BranchesPage() {
  const router = useRouter()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadBranches()
  }, [])

  const checkAuthAndLoadBranches = async () => {
    // Check auth
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Load branches
    await loadBranches()
  }

  const loadBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error

      setBranches(data || [])
    } catch (error) {
      console.error('Error loading branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchClick = (branchId) => {
    // Navigate to branch details or book appointment with this branch
    router.push(`/dashboard/book-appointment?branch=${branchId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">เลือกสาขา</h1>
          </div>
          <p className="text-gray-600 ml-15">เลือกสาขาที่คุณต้องการรับบริการ</p>
        </div>

        {/* Branches List */}
        <div className="space-y-4">
          {branches.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบข้อมูลสาขา</p>
            </div>
          ) : (
            branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchClick(branch.id)}
                className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {branch.name}
                      </h3>
                      {branch.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{branch.address}</span>
                        </div>
                      )}
                      {branch.phone && (
                        <p className="text-sm text-gray-500 mt-1">
                          โทร: {branch.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 คำแนะนำ</h3>
          <p className="text-blue-800 text-sm">
            เลือกสาขาที่สะดวกสำหรับคุณ แล้วคุณจะสามารถดูแผนกและบริการที่มีในสาขานั้นๆ
            และสามารถจองนัดหมายได้ทันที
          </p>
        </div>
      </main>
    </div>
  )
}
