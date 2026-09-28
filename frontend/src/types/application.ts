export interface ApplicationResponse {
  applicationId: string
  companyName: string
  applicationLink: string | null
  currentStatus: string
  dateApplied: string | null // ISO date "yyyy-MM-dd"
  lastContactDate: string | null
  followUpDate: string | null
  offerDecisionDeadline: string | null
}

export interface ApplicationRequest {
  companyName: string
  applicationLink?: string | null
  currentStatus: string
  dateApplied?: string | null
  lastContactDate?: string | null
  followUpDate?: string | null
  offerDecisionDeadline?: string | null
}

export interface InterviewResponse {
  interviewDate: string // ISO instant, e.g. "2026-09-10T14:00:00Z"
  roundType: string | null
  notes: string | null
}

export interface InterviewRequest {
  interviewDate: string
  roundType?: string | null
  notes?: string | null
}

export interface StatusChangeResponse {
  changedAt: string // ISO instant
  fromStatus: string | null
  toStatus: string
  note: string | null
}

export interface StatusChangeRequest {
  newStatus: string
  note?: string | null
}

export interface NoteResponse {
  createdAt: string // ISO instant
  text: string
}

export interface NoteRequest {
  text: string
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  interviews: InterviewResponse[]
  statusHistory: StatusChangeResponse[]
  notes: NoteResponse[]
}
