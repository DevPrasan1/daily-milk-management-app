export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 10) return 'Enter a valid 10-digit phone number'
  if (!/^[6-9]/.test(cleaned)) return 'Phone number must start with 6, 7, 8, or 9'
  return null
}

export function validateOtp(otp) {
  if (otp.length !== 6) return 'Enter the 6-digit OTP'
  if (!/^\d{6}$/.test(otp)) return 'OTP must be digits only'
  return null
}

export function validateName(name) {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters'
  if (name.trim().length > 50) return 'Name is too long'
  return null
}

export function validateQuantity(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return 'Enter a valid number'
  if (n < 0) return 'Cannot be negative'
  if (n > 20) return 'Maximum 20L per session'
  return null
}

export function validatePrice(val) {
  const n = parseFloat(val)
  if (isNaN(n) || n <= 0) return 'Enter a valid price'
  if (n > 200) return 'Price seems too high'
  return null
}
