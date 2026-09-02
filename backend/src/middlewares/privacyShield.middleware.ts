import { CandidateProfile } from '../models/types'

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}*****${local[local.length - 1]}@${domain}`
}

export function maskPhone(phone: string): string {
  if (!phone) return phone
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.length <= 4) return '******'
  const first3 = cleaned.slice(0, 3)
  const last4 = cleaned.slice(-4)
  return `${first3} **** ${last4}`
}

export function applyPrivacyShield(profile: CandidateProfile, isCandidateSelf: boolean): CandidateProfile {
  if (isCandidateSelf || !profile.contactPrivacyMask) {
    return profile
  }

  return {
    ...profile,
    email: maskEmail(profile.email),
    phone: maskPhone(profile.phone)
  }
}
