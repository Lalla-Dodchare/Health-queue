/**
 * Custom hook for handling translations between Thai and English
 * NOW USES CONTEXT - language changes update ALL components instantly!
 */

import { useLanguage } from '@/contexts/LanguageContext'

// Re-export useLanguage as useTranslation for backward compatibility
// This allows existing code to keep using useTranslation() without changes
export const useTranslation = useLanguage
