import { getApplication } from '../api/applications'
import { useAsyncData } from './useAsyncData'

export function useApplication(applicationId: string) {
  return useAsyncData(() => getApplication(applicationId), [applicationId])
}
