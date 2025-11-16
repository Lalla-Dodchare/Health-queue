'use client'

/**
 * Language Context
 * Provides global language state across all components
 * Fixes: Language changes now update ALL components immediately
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('th')
  const [isLoading, setIsLoading] = useState(true)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('health-queue-lang')
      if (savedLang && (savedLang === 'th' || savedLang === 'en')) {
        setLanguage(savedLang)
      }
      setIsLoading(false)
    }
  }, [])

  // Change language and persist to localStorage
  const changeLanguage = (lang) => {
    if (lang === 'th' || lang === 'en') {
      setLanguage(lang)
      if (typeof window !== 'undefined') {
        localStorage.setItem('health-queue-lang', lang)
      }
    }
  }

  // Toggle between languages
  const toggleLanguage = () => {
    const newLang = language === 'th' ? 'en' : 'th'
    changeLanguage(newLang)
  }

  // Translation function
  const t = (path) => {
    try {
      const keys = path.split('.')
      let value = translations

      for (const key of keys) {
        value = value[key]
        if (value === undefined) {
          console.warn(`Translation not found for path: ${path}`)
          return path
        }
      }

      return value[language] || value['th'] || path
    } catch (error) {
      console.error('Translation error:', error)
      return path
    }
  }

  const value = {
    language,
    changeLanguage,
    toggleLanguage,
    t,
    isThai: language === 'th',
    isEnglish: language === 'en',
  }

  // Show loading indicator while loading language preference
  if (isLoading) {
    return null
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
