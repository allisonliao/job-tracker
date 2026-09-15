import { listUpcomingFollowUps } from '../api/applications'
import { useAsyncData } from './useAsyncData'

export function useUpcomingFollowUps(dueBy?: string) {
  return useAsyncData(() => listUpcomingFollowUps(dueBy), [dueBy])
}
