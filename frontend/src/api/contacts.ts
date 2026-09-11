import { api } from './client'
import type { ContactRequest, ContactResponse } from '../types/contact'

export function listContacts(companyId: string) {
  return api.get<ContactResponse[]>(`/api/companies/${companyId}/contacts`)
}

export function getContact(companyId: string, contactId: string) {
  return api.get<ContactResponse>(`/api/companies/${companyId}/contacts/${contactId}`)
}

export function createContact(companyId: string, body: ContactRequest) {
  return api.post<ContactResponse>(`/api/companies/${companyId}/contacts`, body)
}

export function updateContact(companyId: string, contactId: string, body: ContactRequest) {
  return api.put<ContactResponse>(`/api/companies/${companyId}/contacts/${contactId}`, body)
}

export function deleteContact(companyId: string, contactId: string) {
  return api.delete(`/api/companies/${companyId}/contacts/${contactId}`)
}
