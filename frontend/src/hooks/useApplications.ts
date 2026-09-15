import { listApplications } from '../api/applications'
import { useAsyncData } from './useAsyncData'

export function useApplications() {
  return useAsyncData(() => listApplications(), [])
}
