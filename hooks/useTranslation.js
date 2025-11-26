'use client'

/**
 * Custom hook for handling translations with next-intl
 * Provides backward compatibility with old LanguageContext
 */

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export const useTranslation = () => {
  const translations = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  // Fallback translation function
  const t = (key) => {
    try {
      const translated = translations(key)
      // If translation returns the key itself, it means it's missing
      if (translated === key) {
        console.warn(`Missing translation for key: ${key}`)
        return key
      }
      return translated
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error)
      return key
    }
  }

  const changeLanguage = (newLocale) => {
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/').filter(Boolean)
    // Remove first segment if it's a locale
    if (['en', 'th', 'zh', 'ru', 'ja', 'ko', 'hi'].includes(segments[0])) {
      segments.shift()
    }
    const newPath = `/${newLocale}/${segments.join('/')}`
    // Force full page reload to apply new locale
    window.location.href = newPath
  }

  const toggleLanguage = () => {
    const newLocale = locale === 'th' ? 'en' : 'th'
    changeLanguage(newLocale)
  }

  return {
    t,
    locale,
    language: locale, // backward compatibility
    changeLanguage,
    setLanguage: changeLanguage, // backward compatibility
    toggleLanguage // backward compatibility
  }
}
