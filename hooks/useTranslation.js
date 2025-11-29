'use client'

/**
 * Custom hook for handling translations with next-intl
 * Provides backward compatibility with old LanguageContext
 */

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export const useTranslation = (namespace = null) => {
  // Import all messages for manual lookup if needed
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  // Load messages dynamically
  const messages = require(`@/messages/${locale}.json`)

  // Fallback translation function with nested key support
  const t = (key) => {
    try {
      // Handle nested keys like 'profile.gender' manually
      if (key && key.includes('.')) {
        const parts = key.split('.')
        let value = messages

        for (const part of parts) {
          value = value?.[part]
          if (value === undefined) {
            console.warn(`Missing translation for key: ${key}`)
            return key
          }
        }

        return value
      }

      // For non-nested keys, try to get from messages
      const value = messages[key]
      if (value === undefined) {
        console.warn(`Missing translation for key: ${key}`)
        return key
      }

      return value
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
