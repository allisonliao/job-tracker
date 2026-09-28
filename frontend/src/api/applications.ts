import { api } from './client'
import type {
  ApplicationDetailResponse,
  ApplicationRequest,
  ApplicationResponse,
  InterviewRequest,
  InterviewResponse,
  NoteRequest,
  NoteResponse,
  StatusChangeRequest,
  StatusChangeResponse,
} from '../types/application'

export function listApplications() {
  return api.get<ApplicationResponse[]>('/api/applications')
}

export function listUpcomingFollowUps(dueBy?: string) {
  const qs = dueBy ? `?dueBy=${dueBy}` : ''
  return api.get<ApplicationResponse[]>(`/api/applications/upcoming${qs}`)
}

export function getApplication(applicationId: string) {
  return api.get<ApplicationDetailResponse>(`/api/applications/${applicationId}`)
}

export function createApplication(body: ApplicationRequest) {
  return api.post<ApplicationResponse>('/api/applications', body)
}

export function updateApplication(applicationId: string, body: ApplicationRequest) {
  return api.put<ApplicationResponse>(`/api/applications/${applicationId}`, body)
}

export function deleteApplication(applicationId: string) {
  return api.delete(`/api/applications/${applicationId}`)
}

export function changeApplicationStatus(applicationId: string, body: StatusChangeRequest) {
  return api.post<ApplicationResponse>(`/api/applications/${applicationId}/status`, body)
}

export function listStatusHistory(applicationId: string) {
  return api.get<StatusChangeResponse[]>(`/api/applications/${applicationId}/status-history`)
}

export function listInterviews(applicationId: string) {
  return api.get<InterviewResponse[]>(`/api/applications/${applicationId}/interviews`)
}

export function addInterview(applicationId: string, body: InterviewRequest) {
  return api.post<InterviewResponse>(`/api/applications/${applicationId}/interviews`, body)
}

export function listNotes(applicationId: string) {
  return api.get<NoteResponse[]>(`/api/applications/${applicationId}/notes`)
}

export function addNote(applicationId: string, body: NoteRequest) {
  return api.post<NoteResponse>(`/api/applications/${applicationId}/notes`, body)
}
