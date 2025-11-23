/**
 * Helper functions for V2 appointment system (two-date booking)
 */

/**
 * Get the display date and time for an appointment
 * @param {Object} appointment - Appointment object with V2 fields
 * @returns {Object} Display date/time information
 */
export function getDisplayDateTime(appointment) {
  if (!appointment) return null

  // If admin has approved a specific slot, show only that
  if (appointment.approved_option === 'primary') {
    return {
      date: appointment.primary_date,
      time: appointment.primary_time,
      isApproved: true,
      slot: 'primary'
    }
  } else if (appointment.approved_option === 'secondary') {
    return {
      date: appointment.secondary_date,
      time: appointment.secondary_time,
      isApproved: true,
      slot: 'secondary'
    }
  }

  // If not approved yet, return both options
  return {
    date: appointment.primary_date,
    time: appointment.primary_time,
    isApproved: false,
    hasAlternative: !!(appointment.secondary_date && appointment.secondary_time),
    alternativeDate: appointment.secondary_date,
    alternativeTime: appointment.secondary_time,
    isPrimaryFlexible: appointment.primary_flexible,
    isSecondaryFlexible: appointment.secondary_flexible
  }
}

/**
 * Get both date options for pending appointments
 * @param {Object} appointment - Appointment object
 * @returns {Object} Both date options
 */
export function getBothDateOptions(appointment) {
  if (!appointment) return null

  return {
    primary: {
      date: appointment.primary_date,
      time: appointment.primary_time,
      isFlexible: appointment.primary_flexible
    },
    secondary: appointment.secondary_date && appointment.secondary_time ? {
      date: appointment.secondary_date,
      time: appointment.secondary_time,
      isFlexible: appointment.secondary_flexible
    } : null,
    approvedSlot: appointment.approved_option
  }
}

/**
 * Check if appointment date has passed
 * @param {Object} appointment - Appointment object
 * @returns {boolean} True if appointment date has passed
 */
export function isAppointmentPast(appointment) {
  if (!appointment) return false

  const displayDateTime = getDisplayDateTime(appointment)
  if (!displayDateTime || !displayDateTime.date || !displayDateTime.time) {
    return false
  }

  const appointmentDate = new Date(`${displayDateTime.date}T${displayDateTime.time}`)
  return appointmentDate < new Date()
}

/**
 * Format appointment date/time for display
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:MM)
 * @param {string} locale - Locale ('th-TH' or 'en-US')
 * @returns {Object} Formatted date and time
 */
export function formatAppointmentDateTime(date, time, locale = 'th-TH') {
  if (!date) return { date: 'N/A', time: 'N/A' }

  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    date: formattedDate,
    time: time || 'N/A'
  }
}

/**
 * Get SQL select fields for appointments (V2)
 * Use this in Supabase queries to ensure all V2 fields are fetched
 */
export const APPOINTMENT_V2_FIELDS = `
  id,
  user_id,
  doctor_id,
  branch_id,
  department_id,
  primary_date,
  primary_time,
  secondary_date,
  secondary_time,
  primary_flexible,
  secondary_flexible,
  approved_option,
  queue_number,
  status,
  symptoms,
  notes,
  created_at
`

/**
 * Validate two-date booking input
 * @param {Object} bookingData - Booking form data
 * @returns {Object} { isValid, errors }
 */
export function validateTwoDateBooking(bookingData) {
  const errors = []

  // Primary date/time is required
  if (!bookingData.primary_date) {
    errors.push('primary_date_required')
  }
  if (!bookingData.primary_time) {
    errors.push('primary_time_required')
  }

  // If secondary date is provided, time must also be provided (and vice versa)
  if (bookingData.secondary_date && !bookingData.secondary_time) {
    errors.push('secondary_time_required')
  }
  if (!bookingData.secondary_date && bookingData.secondary_time) {
    errors.push('secondary_date_required')
  }

  // Primary and secondary dates should not be the same
  if (
    bookingData.primary_date &&
    bookingData.secondary_date &&
    bookingData.primary_date === bookingData.secondary_date &&
    bookingData.primary_time === bookingData.secondary_time
  ) {
    errors.push('dates_must_be_different')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
