'use client'

/**
 * SearchDoctor Component
 * Provides search functionality for finding doctors by name, specialty, or symptoms
 * Integrates with Supabase doctors table
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { Search, Stethoscope, MapPin, Clock, X } from 'lucide-react'

export default function SearchDoctor({ isOpen, onClose }) {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search doctors in Supabase
  const searchDoctors = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          user_id,
          full_name,
          name_th,
          name_en,
          specialization,
          specialty_th,
          specialty_en,
          hospital_branch,
          profile_image,
          available_days,
          consultation_fee
        `)
        .or(`full_name.ilike.%${searchQuery}%,name_th.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,specialty_th.ilike.%${searchQuery}%,specialty_en.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      setResults(data || [])
    } catch (error) {
      console.error('Error searching doctors:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDoctors(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Handle doctor selection
  const handleSelectDoctor = (doctorId) => {
    router.push(`/dashboard/doctors/${doctorId}`)
    setQuery('')
    setShowResults(false)
    onClose?.()
  }

  // Handle book appointment
  const handleBookAppointment = (doctorId, e) => {
    e.stopPropagation()
    router.push(`/dashboard/appointments/new?doctor=${doctorId}`)
    setQuery('')
    setShowResults(false)
    onClose?.()
  }

  // Get doctor name based on language
  const getDoctorName = (doctor) => {
    if (language === 'en' && doctor.name_en) {
      return doctor.name_en
    }
    if (language === 'th' && doctor.name_th) {
      return doctor.name_th
    }
    return doctor.full_name || 'Unknown Doctor'
  }

  // Get specialty based on language
  const getSpecialty = (doctor) => {
    if (language === 'en' && doctor.specialty_en) {
      return doctor.specialty_en
    }
    if (language === 'th' && doctor.specialty_th) {
      return doctor.specialty_th
    }
    return doctor.specialization || 'General Practice'
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={t('header.searchPlaceholder')}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[500px] overflow-y-auto z-50">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-600">{t('search.searching')}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('search.noResults')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => handleSelectDoctor(doctor.id)}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Doctor Avatar */}
                    <div className="flex-shrink-0">
                      {doctor.profile_image ? (
                        <img
                          src={doctor.profile_image}
                          alt={getDoctorName(doctor)}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                          {getDoctorName(doctor).charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {getDoctorName(doctor)}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {getSpecialty(doctor)}
                        </span>
                      </div>

                      {doctor.hospital_branch && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {t('search.branch')}: {doctor.hospital_branch}
                          </span>
                        </div>
                      )}

                      {doctor.available_days && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            {t('search.availableSlots')}: {doctor.available_days}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={(e) => handleBookAppointment(doctor.id, e)}
                      className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {t('search.bookNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
