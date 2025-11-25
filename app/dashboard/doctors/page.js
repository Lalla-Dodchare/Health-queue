'use client'

/**
 * Find Doctors Page
 * Search and filter doctors by branch and department
 * Browse all available doctors with their specialties
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  Search,
  Stethoscope,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Filter,
  Building2,
  Users,
} from 'lucide-react'

export default function DoctorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 3 columns x 3 rows

  // Load user and data
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await Promise.all([
        loadDoctors(),
        loadBranches(),
        loadDepartments()
      ])
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Handle query parameters (branch filter from header)
  useEffect(() => {
    const branchParam = searchParams.get('branch')
    if (branchParam) {
      setSelectedBranch(branchParam)
      setShowFilters(true) // Auto-open filters to show the selection
    }
  }, [searchParams])

  // Load doctors with relations
  const loadDoctors = async () => {
    try {
      // Load doctors without relations (to avoid FK conflicts)
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, contact_name, contact_email, specialty, image_url, status, branch_id, department_id')
        .eq('status', 'active')
        .order('contact_name')

      if (doctorsError) throw doctorsError

      // Load branches separately
      const { data: branchesData } = await supabase
        .from('branches')
        .select('id, name')

      // Load departments separately
      const { data: deptsData } = await supabase
        .from('departments')
        .select('id, name')

      // Create lookup maps
      const branchMap = {}
      branchesData?.forEach(b => branchMap[b.id] = b)

      const deptMap = {}
      deptsData?.forEach(d => deptMap[d.id] = d)

      // Merge data manually
      const enrichedDoctors = doctorsData?.map(doctor => ({
        ...doctor,
        branches: doctor.branch_id ? branchMap[doctor.branch_id] : null,
        departments: doctor.department_id ? deptMap[doctor.department_id] : null
      })) || []

      setDoctors(enrichedDoctors)
      setFilteredDoctors(enrichedDoctors)
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  // Load branches
  const loadBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error loading branches:', error)
    }
  }

  // Load departments
  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...doctors]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.branches?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.departments?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(doctor => doctor.branch_id === parseInt(selectedBranch))
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(doctor => doctor.department_id === parseInt(selectedDepartment))
    }

    setFilteredDoctors(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedBranch, selectedDepartment, doctors])

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedBranch('all')
    setSelectedDepartment('all')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedBranch !== 'all') count++
    if (selectedDepartment !== 'all') count++
    return count
  }

  // Get doctor image based on name prefix
  const getDoctorImage = (doctorName) => {
    if (!doctorName) return null

    // Male doctors (นพ., ทพ.)
    if (doctorName.startsWith('นพ.') || doctorName.startsWith('ทพ.')) {
      return '/images/doctors/doctor-male.jpg'
    }

    // Female doctors (พญ., ทพญ.)
    if (doctorName.startsWith('พญ.') || doctorName.startsWith('ทพญ.')) {
      return '/images/doctors/doctor-female.jpg'
    }

    // Default to male if no match
    return '/images/doctors/doctor-male.jpg'
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('doctors.title')}</h1>
          <p className="text-gray-600">{t('doctors.searchDoctor')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('doctors.showing')} {filteredDoctors.length} {t('doctors.results')}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('doctors.searchDoctor')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">{t('doctors.filterBy')}</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('doctors.filterBy')}</h3>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.branch')}
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('doctors.allBranches')}</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.clinic')}
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('doctors.allDepartments')}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('doctors.noDoctorsFound')}</h3>
            <p className="text-gray-600 mb-4">
              {t('doctors.noDoctorsFound')}
            </p>
            {(searchQuery || selectedBranch !== 'all' || selectedDepartment !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* Doctor Image */}
                <div className="relative h-[28rem] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                  {doctor.image_url || getDoctorImage(doctor.contact_name) ? (
                    <img
                      src={doctor.image_url || getDoctorImage(doctor.contact_name)}
                      alt={doctor.contact_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Stethoscope className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {doctor.contact_name}
                  </h3>

                  {/* Specialty */}
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Stethoscope className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">
                      {doctor.departments?.name || doctor.specialty || 'ทั่วไป'}
                    </span>
                  </div>

                  {/* Branch */}
                  {doctor.branches && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{doctor.branches.name}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/book-appointment/new?doctor=${doctor.id}&branch=${doctor.branch_id}&department=${doctor.department_id}`)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      {t('doctors.makeAppointment')}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/doctors/${doctor.id}`)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label={t('doctors.details')}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ←
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
