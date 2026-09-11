export interface JobPostingResponse {
  jobId: string
  companyId: string
  title: string
  url: string | null
  location: string | null
  dateFound: string | null // ISO date "yyyy-MM-dd"
  applicationDeadline: string | null // ISO date "yyyy-MM-dd"
}

export interface JobPostingRequest {
  title: string
  url?: string | null
  location?: string | null
  dateFound?: string | null
  applicationDeadline?: string | null
}
