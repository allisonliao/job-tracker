export interface ContactResponse {
  contactId: string
  companyId: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
}

export interface ContactRequest {
  name: string
  role?: string | null
  email?: string | null
  phone?: string | null
}
