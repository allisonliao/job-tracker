import { api } from './client'
import type { JobPostingRequest, JobPostingResponse } from '../types/jobPosting'

export function listJobPostings(companyId: string) {
  return api.get<JobPostingResponse[]>(`/api/companies/${companyId}/job-postings`)
}

export function getJobPosting(companyId: string, jobId: string) {
  return api.get<JobPostingResponse>(`/api/companies/${companyId}/job-postings/${jobId}`)
}

export function createJobPosting(companyId: string, body: JobPostingRequest) {
  return api.post<JobPostingResponse>(`/api/companies/${companyId}/job-postings`, body)
}

export function updateJobPosting(companyId: string, jobId: string, body: JobPostingRequest) {
  return api.put<JobPostingResponse>(`/api/companies/${companyId}/job-postings/${jobId}`, body)
}

export function deleteJobPosting(companyId: string, jobId: string) {
  return api.delete(`/api/companies/${companyId}/job-postings/${jobId}`)
}
