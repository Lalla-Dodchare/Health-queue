'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/Sidebar'
import { Building2, Plus, Stethoscope } from 'lucide-react'

export default function AdminDepartmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [branchesWithDepts, setBranchesWithDepts] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login')
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Fetch branches with departments
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Get all branches
        const { data: branches, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .order('id', { ascending: true })

        if (branchError) throw branchError

        // Get branch-department relationships with department details
        const { data: relations, error: relError } = await supabase
          .from('branch_departments')
          .select(`
            branch_id,
            department_id,
            departments (
              id,
              name,
              code
            )
          `)

        if (relError) throw relError

        // Group departments by branch
        const branchesData = branches.map((branch) => ({
          ...branch,
          departments: relations
            .filter((rel) => rel.branch_id === branch.id)
            .map((rel) => rel.departments)
            .sort((a, b) => a.id - b.id),
        }))

        setBranchesWithDepts(branchesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ระบบบริหารกิจ</h1>
            <p className="text-gray-600">จัดการแผนกและสาขาโรงพยาบาล</p>
          </div>

          {/* Branches */}
          <div className="space-y-8">
            {branchesWithDepts.map((branch) => (
              <div key={branch.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">สาขา{branch.name}</h2>
                      <p className="text-sm text-gray-600">
                        {branch.departments.length} ศูนย์/แผนก
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <Plus className="w-4 h-4" />
                    เพิ่มศูนย์
                  </button>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {branch.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium">{dept.name}</span>
                    </div>
                  ))}
                </div>

                {branch.departments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>ยังไม่มีศูนย์/แผนก</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {branchesWithDepts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">ยังไม่มีสาขา</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
